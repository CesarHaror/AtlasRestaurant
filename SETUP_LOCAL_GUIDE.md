# 🚀 Guía de Setup Local - AtlasRestaurant

> **Última actualización**: 29 de diciembre de 2025  
> **Versión**: 1.0 (Production-Ready)

## 📋 Requisitos Previos

### Sistema Operativo
- Linux (recomendado Fedora 40+) o macOS 12+
- Windows 10+ con WSL2

### Software Requerido
```bash
# Node.js y npm
node --version  # v18.0.0 o superior
npm --version   # v9.0.0 o superior

# PostgreSQL
psql --version  # v14 o superior

# Git
git --version   # v2.30 o superior
```

### Instalación de Dependencias Globales

```bash
# macOS
brew install node postgresql

# Fedora/RHEL
sudo dnf install nodejs postgresql postgresql-server

# Ubuntu/Debian
sudo apt install nodejs postgresql postgresql-contrib
```

---

## 🔧 Setup del Proyecto

### 1. Clonar Repositorio

```bash
# Via HTTPS
git clone https://github.com/CesarHaror/AtlasRestaurant.git
cd AtlasRestaurant

# Via SSH (si ya tienes configuradas tus llaves)
git clone git@github.com:CesarHaror/AtlasRestaurant.git
cd AtlasRestaurant
```

### 2. Verificar Ramas

```bash
# Ver ramas locales
git branch -a

# Output esperado:
# * main
#   develop
#   remotes/origin/main
#   remotes/origin/develop

# Para desarrollo, cambiarse a develop
git checkout develop
```

---

## 📦 Backend Setup

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Crear Base de Datos

```bash
# Conectarse a PostgreSQL como usuario postgres
sudo -u postgres psql

# Dentro de psql:
CREATE DATABASE erp_carniceria;
CREATE USER erp_user WITH PASSWORD 'erp_password';
GRANT ALL PRIVILEGES ON DATABASE erp_carniceria TO erp_user;
\q  # salir
```

O usar el script de setup si existe:
```bash
chmod +x setup-atlaserc.sh
./setup-atlaserc.sh
```

### 3. Configurar Variables de Entorno

```bash
# Crear archivo .env en backend/
cp .env.example .env

# Editar y configurar según tu ambiente
nano .env
```

Estructura esperada de `.env`:
```
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=erp_user
DB_PASSWORD=erp_password
DB_NAME=erp_carniceria
DB_SYNCHRONIZE=false

JWT_SECRET=tu_secreto_jwt_aqui
JWT_EXPIRATION=3600

LOG_LEVEL=debug
```

### 4. Correr Migraciones

```bash
# Verificar estado de migraciones
npm run migration:show

# Ejecutar migraciones
npm run migration:run

# O usando NestJS CLI
npm run build
npm run start:prod
```

### 5. Iniciar Backend

```bash
# Desarrollo (con hot reload)
npm run start:dev

# Output esperado:
# [Nest] 12345   - 12/29/2025, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
# [Nest] 12345   - 12/29/2025, 10:30:02 AM     LOG [InstanceLoader] DatabaseModule dependencies initialized
# [Nest] 12345   - 12/29/2025, 10:30:02 AM     LOG [RoutesResolver] RestaurantsController {/api/restaurants}: true
# [Nest] 12345   - 12/29/2025, 10:30:03 AM     LOG [NestApplication] Nest application successfully started
```

**Backend URL**: `http://localhost:3000`

---

## 🎨 Frontend Setup

### 1. Instalar Dependencias

```bash
cd frontend
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Crear archivo .env en frontend/
cp .env.example .env

# Editar según tu configuración
nano .env
```

Estructura esperada:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=AtlasRestaurant
VITE_APP_VERSION=1.0.0
```

### 3. Iniciar Frontend en Desarrollo

```bash
# Modo desarrollo (hot reload)
npm run dev

# Output esperado:
# VITE v7.2.2  running at:
#   ➜  Local:   http://localhost:5173/
#   ➜  press h to show help
```

**Frontend URL**: `http://localhost:5173`

### 4. Build para Producción

```bash
npm run build

# Output esperado:
# ✓ 1234 modules transformed.
# dist/index.html                   0.45 kB │ gz:  0.29 kB
# dist/assets/main.xxxxx.js   123.45 kB │ gz: 34.56 kB
# ✓ built in 23.45s
```

---

## 🧪 Testing de Endpoints

### Backend API Health Check

```bash
# Verificar que el backend está activo
curl http://localhost:3000/health

# Debería retornar:
# {"status":"up"}
```

### Endpoints Principales

```bash
# Obtener restaurantes
curl http://localhost:3000/api/restaurants

# Obtener menú
curl http://localhost:3000/api/menu

# Obtener órdenes
curl http://localhost:3000/api/orders
```

### Autenticación (si aplica)

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.com","password":"password123"}'

# Token será retornado como JWT
# Usar en headers: Authorization: Bearer <token>
```

---

## 📚 Estructura del Proyecto

```
AtlasRestaurant/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── restaurants/     # Gestión de restaurantes
│   │   │   ├── menu/            # Gestión de menú
│   │   │   ├── orders/          # Gestión de órdenes
│   │   │   ├── auth/            # Autenticación
│   │   │   ├── users/           # Usuarios
│   │   │   ├── branches/        # Sucursales
│   │   │   ├── inventory/       # Inventario
│   │   │   ├── permissions/     # Permisos
│   │   │   └── dashboard/       # Dashboard
│   │   ├── common/              # Código compartido
│   │   └── app.module.ts        # Módulo principal
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # Llamadas a API
│   │   ├── types/               # Tipos TypeScript
│   │   ├── pages/               # Páginas/Vistas
│   │   ├── components/          # Componentes reutilizables
│   │   ├── services/            # Servicios
│   │   ├── hooks/               # Custom hooks
│   │   ├── layouts/             # Layouts
│   │   ├── App.tsx              # Componente principal
│   │   └── main.tsx             # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── CONSOLIDATION_COMPLETE.md    # Resumen de consolidación
├── CLEANUP_COMPLETE_FINAL.md    # Documentación del cleanup
└── SETUP_LOCAL_GUIDE.md         # Este archivo
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module"

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 already in use"

```bash
# Encontrar proceso en puerto 3000
lsof -i :3000

# Terminar proceso
kill -9 <PID>

# O usar otro puerto
PORT=3001 npm run start:dev
```

### Error: "Database connection failed"

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Si no está activo, iniciar
sudo systemctl start postgresql

# Verificar credenciales en .env
psql -U erp_user -d erp_carniceria -c "SELECT 1;"
```

### Error: "VITE_API_BASE_URL not defined"

```bash
# Asegurarse que .env existe en frontend/
ls -la frontend/.env

# Si no existe, copiar del ejemplo
cp frontend/.env.example frontend/.env
```

### Frontend no conecta con Backend

```bash
# Verificar que backend está corriendo en puerto 3000
curl http://localhost:3000/health

# Verificar que frontend .env apunta a la URL correcta
cat frontend/.env | grep VITE_API_BASE_URL

# Debería ser: VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 🔐 Seguridad en Desarrollo

### Nunca comitear .env

```bash
# Verificar que .env está en .gitignore
cat .gitignore | grep ".env"

# Debería incluir:
# .env
# .env.local
# .env.*.local
```

### Usar contraseñas fuertes

```bash
# Generar contraseña aleatoria para desarrollo
openssl rand -base64 32
```

### JWT Secret

```bash
# Generar JWT secret seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📱 Primeros Pasos Después del Setup

### 1. Verificar que todo está funcionando

```bash
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Verificar endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/restaurants
```

### 2. Crear usuario admin (si aplica)

```bash
# Via API o script de reset
cd backend
node reset-admin.js
# Output: Admin user created with email: admin@restaurant.com
```

### 3. Acceder al frontend

```
Abrir en navegador: http://localhost:5173
```

---

## 🚀 Desarrollo Continuo

### Crear feature branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# Hacer cambios...
git add .
git commit -m "feat: Descripción de la funcionalidad"
git push origin feature/nueva-funcionalidad
```

### Pull Request

1. Ir a GitHub
2. Crear Pull Request desde `feature/` a `develop`
3. Describir cambios
4. Esperar review

### Actualizar con main

```bash
git checkout develop
git pull origin main
# Resolver conflictos si los hay
git push origin develop
```

---

## 📖 Comandos Útiles

### Backend

```bash
npm run start:dev          # Iniciar en desarrollo
npm run start:prod         # Iniciar en producción
npm run build              # Compilar TypeScript
npm run test               # Correr tests unitarios
npm run test:e2e           # Correr tests E2E
npm run lint               # Verificar linting
npm run migration:show     # Ver migraciones pendientes
npm run migration:run      # Ejecutar migraciones
```

### Frontend

```bash
npm run dev                # Iniciar dev server
npm run build              # Build para producción
npm run preview            # Preview del build
npm run lint               # Verificar linting
npm run type-check         # Verificar tipos TypeScript
```

---

## 🎓 Recursos Útiles

- **NestJS Docs**: https://docs.nestjs.com
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Vite Docs**: https://vitejs.dev
- **PostgreSQL Docs**: https://www.postgresql.org/docs

---

## ✅ Checklist de Setup Completo

- [ ] Node.js v18+ instalado
- [ ] PostgreSQL instalado y corriendo
- [ ] Repositorio clonado
- [ ] Backend: npm install completado
- [ ] Frontend: npm install completado
- [ ] Base de datos creada y usuario configurado
- [ ] .env backend configurado
- [ ] .env frontend configurado
- [ ] Backend compilado sin errores: `npm run build`
- [ ] Frontend compilado sin errores: `npm run build`
- [ ] Backend inicia sin errores: `npm run start:dev`
- [ ] Frontend inicia sin errores: `npm run dev`
- [ ] Endpoints responden: `curl http://localhost:3000/health`
- [ ] Frontend accesible: `http://localhost:5173`

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa el archivo `.log` más reciente en `backend/logs/`
2. Verifica la consola del navegador (DevTools)
3. Consulta la sección Troubleshooting de esta guía
4. Abre un issue en GitHub

---

**¡Listo para desarrollar! 🚀**

Contáctame si necesitas ayuda con el setup local.
