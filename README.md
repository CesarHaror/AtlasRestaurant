# AtlasERP - Sistema de Gestión Empresarial

**Completo sistema ERP para gestión integral de operaciones empresariales**

## 📚 Documentación

Toda la documentación del proyecto se encuentra en la carpeta [`DOCS/`](./DOCS/):

- **[00_INICIO_AQUI.md](./DOCS/00_INICIO_AQUI.md)** ← **COMIENZA AQUÍ** - Guía de inicio rápido
- **[README.md](./DOCS/README.md)** - Setup y configuración inicial
- **[DEPLOY_GUIDE.md](./DOCS/DEPLOY_GUIDE.md)** - Guía técnica de deployment (22 KB)
- **[DRP_PLAN.md](./DOCS/DRP_PLAN.md)** - Plan de recuperación ante desastres
- **[ESTADO_FINAL.md](./DOCS/ESTADO_FINAL.md)** - Informe final del proyecto
- **[QUICK_CHECK.md](./DOCS/QUICK_CHECK.md)** - Checklist pre-deployment
- **[DOCUMENTACION.md](./DOCS/DOCUMENTACION.md)** - Índice completo de documentación
- **[ESTRUCTURA_DOCUMENTACION.txt](./DOCS/ESTRUCTURA_DOCUMENTACION.txt)** - Estructura de archivos
- **[GITHUB_DEPLOYMENT.md](./DOCS/GITHUB_DEPLOYMENT.md)** - Guía de GitHub y deployment

## 🚀 Inicio Rápido

```bash
# 1. Clonar el repositorio
git clone https://github.com/CesarHaror/AtlasERP.git
cd AtlasERP

# 2. Instalación automática completa
bash setup-atlaserc.sh

# 3. Iniciar todos los servicios
bash start-all.sh
```

## 📊 Estructura del Proyecto

```
AtlasERP/
├── backend/          # API NestJS + TypeORM
├── frontend/         # UI React + Vite
├── pos/              # Sistema POS TypeScript + React
├── DOCS/             # Documentación completa
├── schema.sql        # Schema de base de datos
└── README.md         # Este archivo
```

## ✅ Estado Actual

- ✅ **Backend**: NestJS compilado (0 errores)
- ✅ **Frontend**: React compilado (0 errores)  
- ✅ **POS**: TypeScript compilado (0 errores)
- ✅ **Base de datos**: PostgreSQL con 50+ tablas
- ✅ **API**: 100+ endpoints funcionales
- ✅ **TRANSFER Module**: Completamente implementado
- ✅ **Documentación**: 1900+ líneas
- ✅ **GitHub**: Todo versionado y backup seguro

## 📦 Características Principales

- 🏪 Gestión de almacenes y inventario
- 📦 Control de movimientos de stock (PURCHASE, ADJUSTMENT, WASTE, INITIAL, TRANSFER)
- 👥 Administración de usuarios y roles
- 💰 Módulo de punto de venta (POS)
- 📱 Multi-sesión y control de caja
- 🔐 Autenticación JWT
- 📊 Sistema de reportes
- 🔄 Transacciones atómicas
- ⚡ FIFO lot management

## 🔐 Puntos de Recuperación

Tienes 3 copias seguras de tu código:

1. **Local**: `/home/cesar/Documents/AtlasERP/`
2. **GitHub**: https://github.com/CesarHaror/AtlasERP
3. **Backup**: `AtlasERP_backup_20251210_083930.tar.gz` (183 MB)

## 📍 Próximos Pasos

1. Lee **[DOCS/00_INICIO_AQUI.md](./DOCS/00_INICIO_AQUI.md)** para setup completo
2. Ejecuta `bash setup-atlaserc.sh` para instalación automática
3. Consulta **[DOCS/DEPLOY_GUIDE.md](./DOCS/DEPLOY_GUIDE.md)** para deployment
4. Revisa **[DOCS/DRP_PLAN.md](./DOCS/DRP_PLAN.md)** para recuperación ante desastres

## 📌 Información General

- **Lenguajes**: TypeScript, JavaScript, SQL
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Frontend**: React, Vite
- **Base de Datos**: PostgreSQL 12+
- **Node.js**: v18+
- **Documentación**: Markdown (1900+ líneas)

---

**Última actualización**: 10 de Diciembre de 2025  
**Repository**: https://github.com/CesarHaror/AtlasERP  
**Commits**: 0527821e, 14e93834
