#!/bin/bash

###############################################################################
# AtlasERP - Automated Setup Script
# Este script automatiza el proceso completo de instalación y configuración
# Uso: sudo bash setup-atlaserc.sh
###############################################################################

set -e  # Salir si hay error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones útiles
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

###############################################################################
# PASO 0: Validaciones previas
###############################################################################

print_header "Validaciones Previas"

# Verificar si se ejecuta con sudo
if [ "$EUID" -ne 0 ]; then
    print_error "Este script debe ejecutarse con sudo"
    exit 1
fi

print_success "Ejecutando con permisos de administrador"

# Detectar distro
if [ -f /etc/os-release ]; then
    . /etc/os-release
    print_info "Sistema Operativo: $PRETTY_NAME"
else
    print_error "No se pudo detectar el Sistema Operativo"
    exit 1
fi

###############################################################################
# PASO 1: Instalar dependencias del SO
###############################################################################

print_header "Instalando Dependencias del Sistema"

if command -v dnf &> /dev/null; then
    # Fedora/RHEL
    dnf check-update
    dnf install -y nodejs npm postgresql-server postgresql-contrib git curl wget
elif command -v apt &> /dev/null; then
    # Debian/Ubuntu
    apt-get update
    apt-get install -y nodejs npm postgresql postgresql-contrib git curl wget
else
    print_error "Sistema no soportado (solo Fedora/RHEL o Debian/Ubuntu)"
    exit 1
fi

print_success "Dependencias del SO instaladas"

###############################################################################
# PASO 2: Verificar versiones
###############################################################################

print_header "Verificando Versiones"

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
PG_VERSION=$(postgres --version 2>/dev/null || echo "No instalado")

print_info "Node.js: $NODE_VERSION"
print_info "npm: $NPM_VERSION"
print_info "PostgreSQL: $PG_VERSION"

# Validar Node >= 18
NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
    print_error "Node.js debe ser v18 o superior (actual: $NODE_VERSION)"
    exit 1
fi

print_success "Versiones validadas"

###############################################################################
# PASO 3: Configurar PostgreSQL
###############################################################################

print_header "Configurando PostgreSQL"

# Inicializar BD si no existe
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL no instalado correctamente"
    exit 1
fi

# Iniciar PostgreSQL
systemctl start postgresql
systemctl enable postgresql
print_success "PostgreSQL iniciado y habilitado"

# Crear usuario y BD
print_info "Creando usuario de BD y base de datos..."

# Generar contraseña segura
DB_PASSWORD=$(openssl rand -base64 32)

# Crear usuario y BD
sudo -u postgres psql << EOF
-- Crear usuario
CREATE USER atlas_user WITH PASSWORD '$DB_PASSWORD';

-- Crear BD
CREATE DATABASE erp_carniceria OWNER atlas_user;

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE erp_carniceria TO atlas_user;
ALTER USER atlas_user SUPERUSER;

-- Mostrar resultado
\du+ atlas_user
\l erp_carniceria
EOF

print_success "Usuario y BD creados"
print_warning "Contraseña de BD: $DB_PASSWORD (guardar en lugar seguro)"

###############################################################################
# PASO 4: Extraer y preparar proyecto
###############################################################################

print_header "Extrayendo y Preparando Proyecto"

# Buscar backup más reciente
BACKUP_FILE=$(ls -t AtlasERP_backup_*.tar.gz 2>/dev/null | head -1)

if [ -z "$BACKUP_FILE" ]; then
    print_error "No se encontró backup de AtlasERP"
    print_info "Buscar archivos: AtlasERP_backup_*.tar.gz"
    exit 1
fi

print_info "Usando backup: $BACKUP_FILE"

# Extraer
mkdir -p /opt
tar -xzf "$BACKUP_FILE" -C /opt
PROJECT_DIR="/opt/AtlasERP"
cd "$PROJECT_DIR"

print_success "Proyecto extraído en $PROJECT_DIR"

###############################################################################
# PASO 5: Configurar Backend
###############################################################################

print_header "Configurando Backend"

cd "$PROJECT_DIR/backend"

# Instalar dependencias
print_info "Instalando dependencias de npm..."
npm install --legacy-peer-deps

# Generar JWT_SECRET seguro
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Crear .env
print_info "Creando archivo .env..."
cat > .env << EOF
# Database PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=atlas_user
DB_PASSWORD=$DB_PASSWORD
DB_DATABASE=erp_carniceria

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRATION=24h

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# API
API_PORT=3000
NODE_ENV=production

# Logging
LOG_LEVEL=debug
EOF

print_success "Archivo .env creado"

# Ejecutar migraciones
print_info "Ejecutando migraciones de BD..."
psql -U atlas_user -d erp_carniceria -f ../schema.sql

# Ejecutar migraciones adicionales
if [ -d migrations ]; then
    for migration in migrations/*.sql; do
        print_info "Ejecutando: $(basename $migration)"
        psql -U atlas_user -d erp_carniceria -f "$migration"
    done
fi

print_success "Migraciones completadas"

# Compilar
print_info "Compilando Backend..."
npm run build
print_success "Backend compilado"

###############################################################################
# PASO 6: Configurar Frontend
###############################################################################

print_header "Configurando Frontend"

cd "$PROJECT_DIR/frontend"

print_info "Instalando dependencias..."
npm install --legacy-peer-deps

# Crear .env
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=AtlasERP Admin
EOF

print_info "Compilando..."
npm run build
print_success "Frontend compilado (dist generado)"

###############################################################################
# PASO 7: Configurar POS
###############################################################################

print_header "Configurando POS"

cd "$PROJECT_DIR/pos"

print_info "Instalando dependencias..."
npm install --legacy-peer-deps

# Crear .env
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=AtlasERP POS
VITE_SESSION_TIMEOUT=300000
EOF

print_info "Compilando..."
npm run build
print_success "POS compilado (dist generado)"

###############################################################################
# PASO 8: Crear usuario del sistema
###############################################################################

print_header "Configurando Usuario del Sistema"

if ! id -u atlas_user > /dev/null 2>&1; then
    useradd -m -s /bin/bash atlas_user
    print_success "Usuario atlas_user creado"
else
    print_info "Usuario atlas_user ya existe"
fi

# Dar permisos
chown -R atlas_user:atlas_user "$PROJECT_DIR"
print_success "Permisos configurados"

###############################################################################
# PASO 9: Crear servicio Systemd
###############################################################################

print_header "Creando Servicio Systemd"

cat > /etc/systemd/system/atlaserc-backend.service << 'EOF'
[Unit]
Description=AtlasERP Backend Server
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=atlas_user
WorkingDirectory=/opt/AtlasERP/backend
ExecStart=/usr/bin/npm run start:prod
Restart=always
RestartSec=10
StandardOutput=append:/var/log/atlaserc-backend.log
StandardError=append:/var/log/atlaserc-backend.log

[Install]
WantedBy=multi-user.target
EOF

# Recargar systemd
systemctl daemon-reload
systemctl enable atlaserc-backend
print_success "Servicio systemd creado y habilitado"

###############################################################################
# PASO 10: Crear directorio de logs
###############################################################################

print_header "Configurando Logs"

mkdir -p /var/log/atlaserc
chown atlas_user:atlas_user /var/log/atlaserc
touch /var/log/atlaserc-backend.log
chown atlas_user:atlas_user /var/log/atlaserc-backend.log

print_success "Directorio de logs creado"

###############################################################################
# PASO 11: Configurar Nginx (Opcional)
###############################################################################

print_header "Configurando Nginx (Opcional)"

if command -v nginx &> /dev/null; then
    print_info "Nginx ya instalado"
else
    print_warning "Nginx no instalado. Instalar manualmente: dnf install nginx -y"
fi

if [ -f /etc/nginx/nginx.conf ]; then
    cat > /etc/nginx/conf.d/atlaserc-frontend.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    root /opt/AtlasERP/frontend/dist;
    index index.html;
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location / {
        try_files $uri /index.html;
    }
}

server {
    listen 81;
    server_name _;
    
    root /opt/AtlasERP/pos/dist;
    index index.html;
    
    location /api/ {
        proxy_pass http://localhost:3000;
    }
    
    location / {
        try_files $uri /index.html;
    }
}
EOF
    
    systemctl enable nginx
    systemctl restart nginx
    print_success "Nginx configurado"
fi

###############################################################################
# PASO 12: Crear script de backup
###############################################################################

print_header "Creando Script de Backup"

mkdir -p /backups/atlaserc
cat > /opt/AtlasERP/scripts/backup-atlas.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/atlaserc"
DB_NAME="erp_carniceria"
DB_USER="atlas_user"
PROJECT_DIR="/opt/AtlasERP"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz
tar -czf $BACKUP_DIR/project_backup_$DATE.tar.gz $PROJECT_DIR

find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
EOF

chmod +x /opt/AtlasERP/scripts/backup-atlas.sh
print_success "Script de backup creado"

###############################################################################
# PASO 13: Guardias finales
###############################################################################

print_header "Verificaciones Finales"

# Verificar BD
print_info "Verificando conexión a BD..."
if psql -U atlas_user -d erp_carniceria -c "SELECT version();" > /dev/null; then
    print_success "Conexión a BD verificada"
else
    print_error "Error conectando a BD"
fi

# Verificar archivos compilados
if [ -d "$PROJECT_DIR/frontend/dist" ]; then
    print_success "Frontend compilado verificado"
else
    print_warning "Frontend no encontrado en dist/"
fi

if [ -d "$PROJECT_DIR/pos/dist" ]; then
    print_success "POS compilado verificado"
else
    print_warning "POS no encontrado en dist/"
fi

###############################################################################
# RESUMEN FINAL
###############################################################################

print_header "🎉 INSTALACIÓN COMPLETADA"

cat << EOF

${GREEN}✓ Sistema instalado y configurado correctamente${NC}

${BLUE}Información Importante:${NC}

Usuario de BD:        atlas_user
Contraseña BD:        $DB_PASSWORD
Base de Datos:        erp_carniceria

JWT_SECRET:           $JWT_SECRET

${BLUE}Iniciar el Sistema:${NC}

1. Iniciar Backend:
   systemctl start atlaserc-backend
   systemctl status atlaserc-backend

2. Ver logs:
   tail -f /var/log/atlaserc-backend.log

3. Acceder a:
   Frontend:  http://localhost:80 (o http://your-ip)
   POS:       http://localhost:81 (o http://your-ip:81)
   Backend:   http://localhost:3000/api

${YELLOW}⚠ IMPORTANTE:${NC}

1. Guardar contraseña de BD en lugar seguro
2. Cambiar JWT_SECRET en archivo .env antes de producción
3. Configurar SSL/TLS (Let's Encrypt)
4. Configurar firewall adecuadamente
5. Realizar backups regularmente

${BLUE}Para más información:${NC}
Consultar: $PROJECT_DIR/DEPLOY_GUIDE.md

${GREEN}¡Sistema Listo!${NC}

EOF

print_info "Presionar ENTER para continuar..."
read

###############################################################################
# Auto-iniciar Backend (Opcional)
###############################################################################

print_header "Iniciar Backend Automáticamente?"

read -p "¿Iniciar ahora? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    systemctl start atlaserc-backend
    print_success "Backend iniciado"
    sleep 2
    systemctl status atlaserc-backend
else
    print_info "Para iniciar manualmente: systemctl start atlaserc-backend"
fi

echo -e "\n${GREEN}Setup completado exitosamente!${NC}\n"
