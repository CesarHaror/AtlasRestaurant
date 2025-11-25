# 🐳 Docker Setup - ERP Carnicerías

Guía completa para levantar el microservicio con Docker en Fedora.

## 📋 Prerequisitos

```bash
# Instalar Docker en Fedora
sudo dnf install docker

# Instalar Docker Compose
sudo dnf install docker-compose

# Iniciar el servicio Docker
sudo systemctl start docker

# (Opcional) Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalación
docker --version
docker-compose --version
```

## 📁 Estructura de archivos

```
/home/cesar/Documents/Docker/
├── Dockerfile              # Para construir imagen del backend
├── docker-compose.yml      # Orquestación de servicios
├── .env.example           # Variables de entorno (copiar a .env)
└── backend/               # Tu proyecto NestJS (clonar aquí)
    ├── src/
    ├── package.json
    └── ...
```

## 🚀 Pasos de Setup

### 1. Clonar o copiar tu proyecto backend

```bash
cd /home/cesar/Documents/Docker
git clone <tu-repo> backend
# O si ya lo tienes:
cp -r /ruta/a/tu/backend ./backend
```

### 2. Crear archivo .env

```bash
cp .env.example .env
```

Editar `.env` con tus valores (usa claves seguras reales, aquí solo placeholders):

```env
DB_PASSWORD=CHANGE_ME_SECURE_DB_PASSWORD
JWT_SECRET=CHANGE_ME_BASE64_64B_SECRET
JWT_REFRESH_SECRET=CHANGE_ME_BASE64_64B_REFRESH_SECRET
```

### 3. Asegurar que backend tenga Dockerfile

El archivo `Dockerfile` aquí ya está listo. Cópialo a tu carpeta backend si es necesario:

```bash
cp Dockerfile backend/
```

### 4. Levantar los servicios

```bash
# Construir y levantar todos los servicios
docker-compose up -d

# Ver logs en vivo
docker-compose logs -f backend

# Ver estado de servicios
docker-compose ps
```

### 5. Verificar que todo funciona

```bash
# Backend funcionando
curl http://localhost:3000/api/docs

# PostgreSQL en puerto 5432
psql -h localhost -U postgres -d erp_carniceria

# Redis en puerto 6379
redis-cli ping

# pgAdmin en http://localhost:5050
# Usuario: admin@example.com
# Contraseña: admin
```

## 🛠️ Comandos útiles

### Gestión de contenedores

```bash
# Ver logs del backend
docker-compose logs -f backend

# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Ejecutar comando en contenedor
docker-compose exec backend npm run seed

# Abrir shell en contenedor
docker-compose exec backend sh

# Parar servicios
docker-compose stop

# Reiniciar servicios
docker-compose restart

# Parar y eliminar contenedores
docker-compose down

# Parar, eliminar y limpiar volúmenes
docker-compose down -v
```

### Base de datos

```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U postgres -d erp_carniceria

# Dentro de psql:
\dt                    # Ver tablas
\d products           # Describir tabla
SELECT * FROM users;  # Query

# Backup
docker-compose exec postgres pg_dump -U postgres erp_carniceria > backup.sql

# Restaurar
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d erp_carniceria
```

### Reconstruir después de cambios

```bash
# Si cambias package.json o dependencias
docker-compose build --no-cache backend

# Levantar de nuevo
docker-compose up -d
```

## 🔧 Solución de problemas

### Puerto ya en uso

```bash
# Cambiar puerto en .env
PORT=3001

# O encontrar qué usa el puerto
lsof -i :3000
kill -9 <PID>
```

### Problemas de permisos Docker

```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# O ejecutar con sudo
sudo docker-compose up -d
```

### Base de datos no se conecta

```bash
# Verificar salud del contenedor
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres

# Resetear volúmenes (cuidado: borra datos)
docker-compose down -v
docker-compose up -d
```

### Schema SQL no se importa

1. Asegurar que `schema.sql` está en `/home/cesar/Documents/Docker/`
2. Eliminar volumen y reiniciar:

```bash
docker-compose down -v
docker-compose up -d
```

## 📊 Monitoreo

### Ver recursos usados

```bash
docker stats
```

### Ver detalles del contenedor

```bash
docker inspect erp-backend
docker inspect erp-postgres
```

## 🔐 Seguridad en Producción

Cambiar antes de deploy:

```env
# Generar secretos seguros:
JWT_SECRET=$(openssl rand -base64 64)
JWT_REFRESH_SECRET=$(openssl rand -base64 64)
DB_PASSWORD=$(openssl rand -base64 32)
```

Cambiar en `docker-compose.yml`:
- `POSTGRES_INITDB_ARGS` para mejor seguridad
- Quitar pgAdmin
- Cambiar `restart: unless-stopped` a otros valores
- Agregar límites de recursos
- Usar redes específicas

## 📝 Notas

- El backend se levanta en modo `start:dev` (con hot-reload)
- Para producción, cambiar a `npm run build && npm run start:prod`
- Los datos de BD persisten en el volumen `postgres_data`
- Redis para cache está configurado pero es opcional en desarrollo

## ❓ ¿Necesitas ayuda?

Si tienes problemas:

```bash
# Ver todos los logs
docker-compose logs

# Verificar configuración
docker-compose config

# Validar compose file
docker-compose config --quiet && echo "OK" || echo "ERROR"
```

¡Éxito! 🚀
