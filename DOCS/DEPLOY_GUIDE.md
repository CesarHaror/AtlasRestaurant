# AtlasERP - Guía Completa de Deploy y Setup

**Fecha**: Diciembre 2025  
**Versión**: 1.0  
**Tamaño Backup**: ~183 MB

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Dependencias por Módulo](#dependencias-por-módulo)
5. [Variables de Entorno](#variables-de-entorno)
6. [Proceso de Deploy](#proceso-de-deploy)
7. [Inicialización de Base de Datos](#inicialización-de-base-de-datos)
8. [Verificación del Sistema](#verificación-del-sistema)
9. [Troubleshooting](#troubleshooting)
10. [Mantenimiento y Backups](#mantenimiento-y-backups)

---

## 📱 Descripción General

**AtlasERP** es un sistema empresarial integral para gestión de carnicería con:
- **Backend**: NestJS + PostgreSQL + TypeORM
- **Frontend**: React + Vite + Ant Design
- **POS**: React + TypeScript + Vite
- **Módulos Principales**:
  - Autenticación y Usuarios
  - Gestión de Productos
  - Sistema de Inventario (PURCHASE, SALE, TRANSFER, ADJUSTMENT, WASTE, INITIAL)
  - Compras
  - Ventas
  - Caja Registradora (POS Multi-sesión)
  - Permisos y Roles

---

## 🖥️ Requisitos del Sistema

### Hardware Mínimo
- CPU: 2 cores (4+ recomendado)
- RAM: 4 GB (8+ recomendado)
- Disco: 10 GB libres (SSD recomendado)
- OS: Linux (Fedora 39+), macOS, o Windows con WSL2

### Software Requerido
```bash
# Sistema Operativo: Linux (ejemplo Fedora)
node --version          # v18.17.0 o superior
npm --version           # 9.0.0 o superior
psql --version          # PostgreSQL 14+
git --version           # Para control de versiones
```

### Instalación de Dependencias del SO (Fedora)
```bash
sudo dnf install nodejs npm postgresql-server postgresql-contrib git -y

# Iniciar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar PostgreSQL
sudo -u postgres psql --version
```

---

## 🗂️ Estructura del Proyecto

```
AtlasERP/
├── backend/                          # NestJS API Server
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/                 # Autenticación
│   │   │   ├── users/                # Gestión de usuarios
│   │   │   ├── products/             # Catálogo de productos
│   │   │   ├── inventory/            # Sistema de inventario ⭐
│   │   │   │   ├── entities/         # InventoryLot, Movement, Transfer, etc.
│   │   │   │   ├── services/         # Lógica de negocio
│   │   │   │   └── dto/              # Data Transfer Objects
│   │   │   ├── purchases/            # Gestión de compras
│   │   │   ├── sales/                # Gestión de ventas
│   │   │   └── dashboard/            # Métricas
│   │   ├── common/
│   │   │   ├── decorators/           # @CurrentUser, @Roles
│   │   │   ├── guards/               # JWT, Roles validation
│   │   │   └── pipes/                # Validación de datos
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   └── redis.provider.ts
│   ├── migrations/                   # Scripts SQL de BD ⭐
│   │   ├── 20251119_alter_username_length.sql
│   │   ├── 20251119_convert_users_id_to_uuid.sql
│   │   ├── 20251209_fix_movement_type_constraint.sql
│   │   └── 20251209_create_inventory_transfers.sql
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                          # Variables de entorno
│   └── ormconfig.json
│
├── frontend/                         # React Admin Panel
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Inventory/            # Gestión de inventario
│   │   │   ├── Products/
│   │   │   ├── Purchases/
│   │   │   ├── Sales/
│   │   │   └── ...
│   │   ├── components/
│   │   ├── api/                      # API clients
│   │   ├── hooks/
│   │   ├── types/
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── pos/                              # React POS Terminal
│   ├── src/
│   │   ├── pages/                    # Vistas del POS
│   │   ├── components/               # Componentes reutilizables
│   │   ├── context/                  # Context API
│   │   ├── api/
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── .env
│
├── schema.sql                        # Schema inicial de BD
├── README.md
└── DEPLOY_GUIDE.md                   # Esta guía

```

---

## 📦 Dependencias por Módulo

### Backend (NestJS)

**Dependencias Principales:**
```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "@nestjs/jwt": "^12.0.0",
  "@nestjs/passport": "^10.0.0",
  "typeorm": "^0.3.17",
  "pg": "^8.11.0",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "redis": "^4.6.0",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1",
  "bcrypt": "^5.1.1",
  "dotenv": "^16.3.1",
  "uuid": "^9.0.1"
}
```

**Instalación:**
```bash
cd backend
npm install
```

**Scripts Disponibles:**
```bash
npm run start        # Desarrollo con recompilación automática
npm run build        # Compilar a producción
npm run start:prod   # Ejecutar versión compilada
npm run typeorm      # CLI de TypeORM (migraciones)
npm run test         # Tests unitarios
npm run test:e2e     # Tests de integración
```

### Frontend (React + Vite)

**Dependencias Principales:**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "antd": "^5.11.0",
  "@ant-design/icons": "^5.2.6",
  "axios": "^1.6.0",
  "dayjs": "^1.11.10",
  "react-router-dom": "^6.19.0"
}
```

**Instalación:**
```bash
cd frontend
npm install
```

**Scripts Disponibles:**
```bash
npm run dev          # Servidor de desarrollo (Vite)
npm run build        # Compilar a producción
npm run preview      # Vista previa de build
npm run lint         # ESLint
```

### POS (React + TypeScript)

**Dependencias Principales:**
```json
{
  "react": "^18.2.0",
  "typescript": "^5.2.0",
  "axios": "^1.6.0",
  "antd": "^5.11.0",
  "zustand": "^4.4.0"
}
```

**Instalación:**
```bash
cd pos
npm install
```

**Scripts Disponibles:**
```bash
npm run dev          # Desarrollo
npm run build        # Build
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

### Base de Datos (PostgreSQL)

**Versión**: PostgreSQL 14+

**Instalación (Fedora):**
```bash
sudo dnf install postgresql-server postgresql-contrib -y
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Inicializar Base de Datos:**
```bash
sudo -u postgres psql

# Dentro de psql:
CREATE USER atlas_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE erp_carniceria OWNER atlas_user;
GRANT ALL PRIVILEGES ON DATABASE erp_carniceria TO atlas_user;
\q
```

---

## 🔐 Variables de Entorno

### Backend - `.env` file

```bash
# Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=atlas_user
DB_PASSWORD=your_secure_password
DB_DATABASE=erp_carniceria

# JWT
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRATION=24h

# Redis (Caché)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password_if_needed

# API
API_PORT=3000
NODE_ENV=development

# Email (Opcional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend - `.env` file

```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=AtlasERP Admin
```

### POS - `.env` file

```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=AtlasERP POS
VITE_SESSION_TIMEOUT=300000
```

---

## 🚀 Proceso de Deploy - Paso a Paso

### Paso 1: Preparar el Sistema

```bash
# 1. Clonar o extraer el proyecto
cd /opt
sudo tar -xzf AtlasERP_backup_20251210_083930.tar.gz
cd AtlasERP

# 2. Verificar Node.js y npm
node --version  # Debe ser v18+
npm --version   # Debe ser 9+

# 3. Crear archivo de configuración de BD
sudo -u postgres psql
CREATE USER atlas_user WITH PASSWORD 'secure_password_here';
CREATE DATABASE erp_carniceria OWNER atlas_user;
GRANT ALL PRIVILEGES ON DATABASE erp_carniceria TO atlas_user;
\q
```

### Paso 2: Configurar Backend

```bash
cd backend

# 1. Instalar dependencias
npm install

# 2. Crear archivo .env con configuración
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=atlas_user
DB_PASSWORD=secure_password_here
DB_DATABASE=erp_carniceria
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_EXPIRATION=24h
API_PORT=3000
NODE_ENV=production
REDIS_HOST=localhost
REDIS_PORT=6379
EOF

# 3. Ejecutar migraciones de BD
npm run typeorm migration:run

# 4. (Opcional) Ejecutar migraciones SQL manuales
psql -U atlas_user -d erp_carniceria -f migrations/20251119_alter_username_length.sql
psql -U atlas_user -d erp_carniceria -f migrations/20251119_convert_users_id_to_uuid.sql
psql -U atlas_user -d erp_carniceria -f migrations/20251209_fix_movement_type_constraint.sql
psql -U atlas_user -d erp_carniceria -f migrations/20251209_create_inventory_transfers.sql

# 5. Compilar a producción
npm run build

# 6. Probar ejecución
npm run start:prod
```

### Paso 3: Configurar Frontend

```bash
cd ../frontend

# 1. Instalar dependencias
npm install

# 2. Crear archivo .env
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=AtlasERP Admin
EOF

# 3. Compilar
npm run build

# El build estará en: ./dist/
```

### Paso 4: Configurar POS

```bash
cd ../pos

# 1. Instalar dependencias
npm install

# 2. Crear archivo .env
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=AtlasERP POS
VITE_SESSION_TIMEOUT=300000
EOF

# 3. Compilar
npm run build

# El build estará en: ./dist/
```

### Paso 5: Configurar Servidor Web (Nginx)

```bash
# Instalar Nginx
sudo dnf install nginx -y

# Crear configuración para Frontend
sudo tee /etc/nginx/conf.d/atlaserc-frontend.conf << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirigir a HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL (usar Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Raíz de frontend
    root /opt/AtlasERP/frontend/dist;
    index index.html;
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # SPA routing
    location / {
        try_files \$uri /index.html;
    }
}
EOF

# POS en puerto diferente
sudo tee /etc/nginx/conf.d/atlaserc-pos.conf << EOF
server {
    listen 81;
    server_name your-domain.com;
    
    root /opt/AtlasERP/pos/dist;
    index index.html;
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
    
    location / {
        try_files \$uri /index.html;
    }
}
EOF

# Activar y reiniciar Nginx
sudo systemctl enable nginx
sudo systemctl restart nginx
```

### Paso 6: Crear Servicio Systemd para Backend

```bash
sudo tee /etc/systemd/system/atlaserc-backend.service << EOF
[Unit]
Description=AtlasERP Backend Server
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=atlas_user
WorkingDirectory=/opt/AtlasERP/backend
Environment="PATH=/home/atlas_user/.nvm/versions/node/v18.17.0/bin"
Environment="NODE_ENV=production"
ExecStart=/home/atlas_user/.nvm/versions/node/v18.17.0/bin/npm run start:prod
Restart=always
RestartSec=10
StandardOutput=append:/var/log/atlaserc-backend.log
StandardError=append:/var/log/atlaserc-backend.log

[Install]
WantedBy=multi-user.target
EOF

# Recargar y activar
sudo systemctl daemon-reload
sudo systemctl enable atlaserc-backend
sudo systemctl start atlaserc-backend

# Verificar estado
sudo systemctl status atlaserc-backend
```

---

## 🗄️ Inicialización de Base de Datos

### Schema Principal

```bash
# El schema.sql contiene la estructura base:
psql -U atlas_user -d erp_carniceria -f schema.sql

# Luego ejecutar migraciones en orden:
psql -U atlas_user -d erp_carniceria -f migrations/20251119_alter_username_length.sql
psql -U atlas_user -d erp_carniceria -f migrations/20251119_convert_users_id_to_uuid.sql
psql -U atlas_user -d erp_carniceria -f migrations/20251209_fix_movement_type_constraint.sql
psql -U atlas_user -d erp_carniceria -f migrations/20251209_create_inventory_transfers.sql
```

### Crear Usuario Admin Inicial

```bash
# Conectar a la BD
psql -U atlas_user -d erp_carniceria

-- Crear usuario admin
INSERT INTO users (id, email, username, password_hash, role, is_active)
VALUES (
    gen_random_uuid(),
    'admin@atlaserc.com',
    'admin',
    '$2b$10$...' -- bcrypt hash de contraseña,
    'Admin',
    true
);

-- Insertar permisos
INSERT INTO permissions (name, slug, description)
VALUES 
    ('Crear Productos', 'create-product', 'Puede crear nuevos productos'),
    ('Editar Inventario', 'edit-inventory', 'Puede modificar inventario'),
    -- ... más permisos
;
```

### Datos de Prueba

```bash
# Insertar almacenes de prueba
INSERT INTO warehouses (name, code, location, is_active)
VALUES 
    ('Almacén Principal', 'ALM001', 'Piso 1', true),
    ('Almacén Secundario', 'ALM002', 'Bodega', true),
    ('Mostrador', 'ALM003', 'Tienda', true);

# Insertar categorías
INSERT INTO categories (name, description, is_active)
VALUES
    ('Carnes Rojas', 'Res, cerdo, etc', true),
    ('Pollo', 'Variedad de pollo', true),
    ('Embutidos', 'Salchichas, jamón, etc', true);
```

---

## ✅ Verificación del Sistema

### Test de Conectividad

```bash
# 1. Base de Datos
psql -U atlas_user -d erp_carniceria -c "SELECT version();"

# 2. Backend
curl http://localhost:3000/api

# 3. Frontend (después de deploy)
curl http://localhost/api/health

# 4. Logs
tail -f /var/log/atlaserc-backend.log
```

### Test de Funcionalidades Críticas

```bash
# 1. Test de autenticación
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# 2. Test de productos
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Test de inventario
curl http://localhost:3000/api/inventory/warehouses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Test de transferencias
curl -X POST http://localhost:3000/api/inventory/transfers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sourceWarehouseId": 1,
    "destinationWarehouseId": 2,
    "productId": 1,
    "lotId": "uuid-here",
    "quantity": 10
  }'
```

---

## 🔧 Troubleshooting

### Error: "database does not exist"

```bash
# Solución: Crear la BD
sudo -u postgres createdb erp_carniceria -O atlas_user
```

### Error: "CONNECTION_REFUSED on PostgreSQL"

```bash
# Verificar servicio
sudo systemctl status postgresql

# Reiniciar
sudo systemctl restart postgresql

# Revisar si escucha en puerto 5432
sudo netstat -tlnp | grep postgres
```

### Error: "JWT validation failed"

```bash
# Verificar .env tiene JWT_SECRET configurado
grep JWT_SECRET backend/.env

# Regenerar si necesario
echo "JWT_SECRET=$(node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\")" >> backend/.env
```

### Error: "Port 3000 already in use"

```bash
# Encontrar qué usa puerto 3000
sudo netstat -tlnp | grep :3000

# Matar proceso
sudo kill -9 <PID>

# O cambiar puerto en .env
echo "API_PORT=3001" >> backend/.env
```

### Error: "CORS blocked request"

```bash
# Verificar CORS está habilitado en backend
# Usualmente configurado automáticamente en main.ts

# Si falla, agregar a main.ts:
app.enableCors({
  origin: ['http://localhost:5173', 'http://your-domain.com'],
  credentials: true
});
```

### Error: "Migrations not running"

```bash
# Verificar tablas existen
psql -U atlas_user -d erp_carniceria -c "\dt"

# Ejecutar manualmente
psql -U atlas_user -d erp_carniceria -f schema.sql
psql -U atlas_user -d erp_carniceria -f migrations/*.sql
```

---

## 💾 Mantenimiento y Backups

### Script de Backup Automático

```bash
#!/bin/bash
# backup-atlas.sh

BACKUP_DIR="/backups/atlaserc"
DB_NAME="erp_carniceria"
DB_USER="atlas_user"
PROJECT_DIR="/opt/AtlasERP"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 1. Backup de BD
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# 2. Backup de archivos
tar -czf $BACKUP_DIR/project_backup_$DATE.tar.gz $PROJECT_DIR

# 3. Limpiar backups viejos (guardar últimos 7 días)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
```

**Usar con cron:**

```bash
# Backup diario a las 2 AM
0 2 * * * /opt/AtlasERP/scripts/backup-atlas.sh >> /var/log/atlaserc-backup.log 2>&1
```

### Restaurar desde Backup

```bash
# 1. Extraer proyecto
tar -xzf AtlasERP_backup_20251210_083930.tar.gz -C /opt/

# 2. Restaurar BD
gunzip < /backups/atlaserc/db_backup_20251210_020000.sql.gz | \
  psql -U atlas_user -d erp_carniceria

# 3. Reiniciar servicios
sudo systemctl restart atlaserc-backend
sudo systemctl restart nginx
```

### Actualización a Nuevas Versiones

```bash
# 1. Hacer backup
./backup-atlas.sh

# 2. Descargar nueva versión
git pull origin main
# O descargar tar.gz

# 3. Instalar dependencias nuevas
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
cd ../pos && npm install && npm run build

# 4. Ejecutar nuevas migraciones si hay
npm run typeorm migration:run

# 5. Reiniciar servicios
sudo systemctl restart atlaserc-backend
sudo systemctl restart nginx
```

---

## 📊 Monitoreo y Logs

### Ver logs en tiempo real

```bash
# Backend
sudo tail -f /var/log/atlaserc-backend.log

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Monitoreo de recursos

```bash
# CPU y memoria
top -p $(pgrep -f "npm run start:prod")

# Conexiones a BD
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Espacio en disco
df -h | grep /opt
```

---

## 🔒 Seguridad

### Cambiar contraseña de BD después de deploy

```bash
sudo -u postgres psql
ALTER USER atlas_user WITH PASSWORD 'new_strong_password';
\q
```

### Configurar SSL/HTTPS

```bash
# Usar Let's Encrypt con Certbot
sudo dnf install certbot python3-certbot-nginx -y

sudo certbot certonly --nginx -d your-domain.com

# Configurar renovación automática
sudo systemctl enable certbot-renew.timer
sudo systemctl start certbot-renew.timer
```

### Firewall

```bash
# Abrir puertos necesarios
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

---

## 📞 Soporte y Debugging

### Información del Sistema

```bash
# OS Info
uname -a
cat /etc/os-release

# Versiones críticas
node --version
npm --version
postgres --version
nginx -v

# Espacios disponibles
df -h
du -sh /opt/AtlasERP
du -sh /backups

# Procesos activos
ps aux | grep -E "node|npm|nginx|postgres"
```

### Test de Rendimiento

```bash
# Benchmark de API
ab -n 100 -c 10 http://localhost:3000/api/health

# Test de transferencia de lotes
curl -X GET "http://localhost:3000/api/inventory/transfers" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✨ Características Implementadas

### ✅ Sistema Completamente Funcional

1. **Autenticación JWT** - Login seguro con tokens
2. **Gestión de Usuarios** - Admin, Gerente, Almacenista
3. **Productos** - Catálogo con SKU, categorías
4. **Almacenes** - Multi-almacén con validaciones
5. **Lotes** - Seguimiento con números internos
6. **Movimientos de Inventario**:
   - ✅ PURCHASE - Compras con auto-lot
   - ✅ ADJUSTMENT - Ajustes positivos/negativos
   - ✅ WASTE - Descartes con FIFO
   - ✅ INITIAL - Stock inicial
   - ✅ TRANSFER - Transferencias entre almacenes ⭐
7. **Compras** - Órdenes de compra
8. **Ventas** - Facturación
9. **POS Multi-Sesión** - Terminal de venta con múltiples cajeros
10. **Dashboard** - Métricas en tiempo real

---

## 📝 Notas Finales

- **Importante**: Cambiar JWT_SECRET antes de producción
- **Backups**: Realizar diariamente, guardar en múltiples ubicaciones
- **Logs**: Monitorear regularmente errores
- **Updates**: Probar en staging antes de aplicar a producción
- **Support**: Revisar logs en `/var/log/atlaserc-*.log`

---

**Sistema Listo para Deploy** ✅  
**Versión**: 1.0  
**Última Actualización**: Dic 10, 2025
