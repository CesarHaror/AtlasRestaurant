# 🎯 AtlasERP - Guía Completa de Uso

## 📦 Componentes del Sistema

AtlasERP está compuesto por tres aplicaciones integradas:

| Componente | Puerto | Función | Tecnología |
|-----------|--------|---------|-----------|
| **Backend API** | 3000 | Servidor REST, BD, lógica | NestJS + TypeORM |
| **Frontend** | 5173 | Sistema ERP principal | React + Ant Design |
| **POS** | 5174 | Punto de Venta | React + Zustand |

---

## 🚀 Inicio Rápido

### Opción 1: Todos los servicios a la vez
```bash
cd /home/cesar/Documents/AtlasERP
chmod +x start-all.sh
./start-all.sh
```

### Opción 2: Iniciar manualmente

**Terminal 1 - Backend**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

**Terminal 3 - POS**
```bash
cd pos
npm run dev
```

---

## 📚 Documentación por Módulo

### 🏢 Backend
- **URL**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Documentación**: `backend/README.md`
- **Endpoints principales**:
  - `POST /auth/login` - Autenticación
  - `GET /products` - Listar productos
  - `POST /sales` - Crear venta
  - `GET /purchases` - Listar compras
  - `POST /purchases` - Crear compra

### 🎨 Frontend (ERP Principal)
- **URL**: http://localhost:5173
- **Documentación**: `frontend/README.md`
- **Módulos**:
  - 👥 Usuarios y Roles
  - 📦 Inventario
  - 🛒 Compras
  - 📊 Reportes

**Usuarios de Prueba**:
```
Email: admin@atlaser.com
Password: Admin123!@

Email: gerente@atlaser.com  
Password: Gerente123!@
```

### 💳 POS (Punto de Venta)
- **URL**: http://localhost:5174
- **Documentación**: `pos/POS_GUIDE.md`
- **Características**:
  - Catálogo de productos
  - Carrito de compras
  - Múltiples métodos de pago
  - Sesiones de caja
  - Cálculos automáticos (descuentos, IVA)

---

## 🔄 Flujos Principales

### 1️⃣ Flujo de Compra (Backend → Frontend)

```
Frontend ERP
  ├─ Login
  ├─ Compras → Crear Compra
  │  ├─ Seleccionar Proveedor
  │  ├─ Agregar Productos
  │  ├─ Ingresar Cantidad
  │  └─ Crear
  ├─ Backend recibe: POST /purchases
  │  ├─ Valida datos
  │  ├─ Crea registros en BD
  │  └─ Actualiza inventario
  └─ Resultado: Compra registrada
```

### 2️⃣ Flujo de Venta (Backend → POS)

```
POS Frontend
  ├─ Abrir Sesión de Caja
  ├─ Ver Productos
  │  ├─ Backend trae: GET /products
  │  └─ Mostrar en grid
  ├─ Agregar al Carrito
  │  └─ Zustand gestiona estado local
  ├─ Procesar Pago
  │  ├─ Backend recibe: POST /sales
  │  ├─ Valida monto total
  │  ├─ Registra venta
  │  └─ Actualiza inventario (PEPS)
  └─ Cerrar Sesión
```

### 3️⃣ Flujo de Inventario

```
Compra → Aumento Stock
  │
  ├─ Producto recibido
  ├─ Stock actualizado
  ├─ Precio de costo registrado
  └─ Lote creado (si PEPS)

Venta → Disminución Stock
  │
  ├─ Producto seleccionado
  ├─ Cantidad restada
  ├─ Lote consumido (PEPS)
  ├─ Costo de venta calculado
  └─ Inventario movimiento registrado
```

---

## 🔐 Autenticación y Autorización

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@atlaser.com",
    "password": "Admin123!@"
  }'
```

**Respuesta**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@atlaser.com",
    "roles": ["admin"]
  }
}
```

### Usar Token
```bash
curl http://localhost:3000/api/protected \
  -H "Authorization: Bearer <tu_token>"
```

---

## 📊 Base de Datos

### Esquema Principal

```sql
-- Usuarios y Roles
users (id, email, username, password, ...)
roles (id, name, description, ...)
permissions (id, name, resource, action)

-- Inventario
products (id, name, sku, price, quantity, ...)
stock_movements (id, product_id, type, quantity, ...)
inventory_adjustments (id, product_id, reason, ...)

-- Compras
purchases (id, supplier_id, status, total_amount, ...)
purchase_items (id, purchase_id, product_id, quantity, ...)

-- Ventas
sales (id, customer_id, total_amount, payment_method, ...)
sale_items (id, sale_id, product_id, quantity, ...)
sale_payments (id, sale_id, method, amount, ...)

-- Punto de Venta
cash_registers (id, code, is_active, ...)
cash_register_sessions (id, cash_register_id, status, ...)
```

---

## 🛠 Comandos Útiles

### Backend
```bash
cd backend

# Desarrollo
npm run start:dev

# Build producción
npm build

# Ejecutar migraciones
npm run typeorm migration:run

# Generar migration
npm run typeorm migration:generate src/migrations/MigrationName

# Seed de datos
npm run seed
```

### Frontend
```bash
cd frontend

# Desarrollo
npm run dev

# Build
npm run build

# Preview del build
npm run preview

# Lint
npm run lint
```

### POS
```bash
cd pos

# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview
```

---

## 🧪 Testing

### Probar Endpoints con cURL

**Obtener productos**:
```bash
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer <token>"
```

**Crear venta**:
```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "cashRegisterSessionId": "uuid",
    "items": [
      {
        "productId": "uuid",
        "quantity": 2,
        "price": 100.00
      }
    ],
    "totalAmount": 200.00,
    "payments": [
      {
        "method": "cash",
        "amount": 200.00
      }
    ]
  }'
```

---

## 📈 Monitoreo y Logs

### Ver logs en vivo
```bash
# Backend
cd backend && npm run start:dev 2>&1 | grep -i error

# Frontend
cd frontend && npm run dev 2>&1 | grep -i error

# POS
cd pos && npm run dev 2>&1 | grep -i error
```

### Base de datos
```bash
# Conectar a PostgreSQL
psql -U usuario -d nombre_bd

# Consultas útiles
SELECT * FROM products;
SELECT * FROM sales ORDER BY created_at DESC LIMIT 10;
SELECT COUNT(*) FROM stock_movements;
```

---

## ⚠️ Solución de Problemas

### Backend no inicia
```bash
# Verificar dependencias
npm install

# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar variables de entorno
cat .env
```

### Frontend no carga
```bash
# Puerto ocupado (5173)
lsof -i :5173
kill -9 <PID>

# O cambiar puerto
npm run dev -- --port 3001
```

### POS sin datos
```bash
# Verificar que backend está corriendo
curl http://localhost:3000/api/products

# Verificar token en localStorage
# En consola: localStorage.getItem('token')
```

---

## 🎓 Recursos Adicionales

| Recurso | Enlace |
|---------|--------|
| NestJS Docs | https://docs.nestjs.com |
| React Docs | https://react.dev |
| TypeORM Docs | https://typeorm.io |
| Ant Design | https://ant.design |
| Zustand | https://github.com/pmndrs/zustand |

---

## 📞 Soporte

**Problemas comunes**:
- ❌ `Cannot find module`: Ejecutar `npm install`
- ❌ `EADDRINUSE`: Puerto en uso, cambiar puerto o matar proceso
- ❌ `Connection refused`: Backend no está corriendo, iniciar primero
- ❌ `401 Unauthorized`: Token expirado, re-login

---

## ✅ Checklist de Inicio

- [ ] PostgreSQL corriendo
- [ ] Variables de entorno configuradas (.env)
- [ ] Backend: `npm install` y `npm run start:dev`
- [ ] Frontend: `npm install` y `npm run dev`
- [ ] POS: `npm install` y `npm run dev`
- [ ] Acceder a http://localhost:3000/api/docs
- [ ] Login exitoso en Frontend
- [ ] Ver productos en POS

---

**Última actualización**: 28 de noviembre de 2025
**Versión**: 1.0.0
**Estado**: ✅ Completamente funcional
