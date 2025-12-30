# 🍽️ AtlasRestaurant

**Sistema POS (Punto de Venta) moderno para restaurantes pequeños y medianos**

**Versión:** 1.0.0 (En Desarrollo)  
**Fecha de Creación:** 29 de Diciembre de 2025  
**Basado en:** AtlasERP (Fork especializado)

---

## 📋 TABLA DE CONTENIDOS

1. [Características Principales](#características)
2. [Requisitos del Sistema](#requisitos)
3. [Especificaciones Técnicas](#especificaciones)
4. [Instalación](#instalación)
5. [Configuración](#configuración)
6. [Roadmap](#roadmap)
7. [Diferencias con AtlasERP](#diferencias)

---

## 🎯 CARACTERÍSTICAS PRINCIPALES

### ✅ Fase 1 (MVP)

- **Punto de Venta Touch**
  - Interfaz optimizada para pantalla táctil
  - Soporte para múltiples cuentas por mesa
  - Búsqueda rápida de platillos

- **Sistema de Mesas**
  - Gestión de 50 mesas máximo
  - Visualización en tiempo real del estado
  - Mapa interactivo de restaurante
  - Zonas de comedor (terraza, interior, bar, etc)

- **Órdenes y Pagos**
  - Creación y modificación de órdenes
  - Métodos de pago: Efectivo y Tarjetas
  - División de cuentas
  - Propinas (% y monto fijo)
  - Múltiples pagos por orden

- **Facturación CFDI 4.0**
  - Emisión bajo demanda
  - Facturas globales (resumen de órdenes)
  - Integración con SAT

- **Modo Offline**
  - ✨ Operación completa sin internet
  - Sincronización automática cuando hay conexión
  - Caché local de menú y órdenes

- **Monitor de Cocina (Kitchen Display)**
  - Vista en tiempo real de órdenes
  - Información crítica: tiempo prep, ingredientes, cliente, mesa
  - Notificaciones visuales

- **Entregas a Domicilio**
  - Gestión de repartidores propios
  - Integración con plataformas (Uber Eats, DoorDash)
  - Seguimiento de estado

- **Reportes**
  - Ventas por período
  - Productos más vendidos
  - Desempeño de meseros
  - Rotación de mesas
  - Desempeño de cocina

---

## 📊 ESPECIFICACIONES TÉCNICAS

### Escala del Sistema

| Métrica | Valor |
|---------|-------|
| Usuarios por sucursal | 10 máximo |
| Mesas | 50 máximo |
| Órdenes concurrentes | 50+ |
| Métodos de pago | 2 (Efectivo, Tarjeta) |
| Sucursales | 1 (Fase 1) |

### Tecnología

```
Backend:   NestJS + TypeORM + PostgreSQL
Frontend:  React + TypeScript + Vite
POS:       React Native/Electron (Touch optimizado)
Mobile:    PWA + React
Offline:   Service Workers + IndexedDB + SQLite
```

### Arquitectura

```
atlas-restaurant/
├── backend/                # API REST (NestJS)
├── frontend/               # Admin Dashboard
├── pos/                    # Terminal POS Touch
├── mobile/                 # PWA Comandera
└── docs/                   # Documentación
```

---

## 🔄 DIFERENCIAS CON ATLASERF

### ❌ ELIMINADO

- ✂️ Compras a proveedores (módulo `purchases`)
- ✂️ Traslados entre sucursales (módulo `transfers`)
- ✂️ Gestión avanzada de lotes (PEPS, transformaciones)
- ✂️ Registro de mermas detallado
- ✂️ Temperatura de neveras

### ✏️ RENOMBRADO/ADAPTADO

| AtlasERP | AtlasRestaurant |
|----------|-----------------|
| `modules/products` | `modules/menu` |
| `ProductCategory` | `MenuCategory` |
| `Product` | `MenuItem` |
| `modules/sales` | `modules/orders` |
| `Sale` | `Order` |
| `companies` | `restaurants` |

### 🆕 NUEVO

- `modules/tables` - Gestión de mesas
- `modules/kitchen` - Kitchen Display System
- `modules/delivery` - Entregas a domicilio
- `modules/reservations` - Sistema de reservas
- `modules/customers` - Programa de lealtad
- `modules/cash-sessions` - Cierre de caja
- `modules/refunds` - Devoluciones
- Auditoría completa de transacciones

---

## 🚀 REQUISITOS DEL SISTEMA

### Hardware Recomendado

**Terminal POS (Linux)**
- Procesador: Intel/AMD de 2+ núcleos
- RAM: 4 GB mínimo
- Almacenamiento: 64 GB SSD
- Pantalla: 15.6" - 21.5" táctil
- Red: Ethernet o WiFi 5G
- Periféricos: Gaveta de dinero, impresoras térmicas WiFi

**Servidor**
- CPU: 2+ cores
- RAM: 8 GB
- Almacenamiento: 500 GB SSD
- Base de datos: PostgreSQL 12+
- Node.js: 18+ LTS

### Software

```bash
# Backend
- Node.js 18+
- PostgreSQL 12+
- npm/yarn

# Frontend
- Node.js 18+
- npm/yarn

# POS Terminal
- Node.js 18+
- Linux (Ubuntu 20.04+ recomendado)
- npm/yarn
```

---

## 📥 INSTALACIÓN

### 1. Clonar Repositorio

```bash
git clone https://github.com/tu-usuario/atlas-restaurant.git
cd atlas-restaurant
```

### 2. Variables de Entorno

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Base de Datos

```bash
cd backend
npm install
npm run typeorm migration:run
npm run seed:admin
```

### 4. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install

# POS
cd pos
npm install
```

### 5. Iniciar Servicios

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: POS
cd pos
npm run dev
```

---

## 🔧 CONFIGURACIÓN INICIAL

### Sistema de Roles y Permisos

```typescript
enum UserRole {
  ADMIN = 'Administrador',      // Control total
  MANAGER = 'Gerente',          // Reportes, caja
  CASHIER = 'Cajero',           // Pagos, reembolsos
  WAITER = 'Mesero',            // Órdenes
  COOK = 'Cocinero',            // Kitchen Display
  BARMAN = 'Barman',            // Bebidas
  DELIVERY = 'Repartidor'       // Entregas
}
```

### Configuración de Restaurante

```typescript
// RestaurantSettings
{
  operatingHoursOpen: '10:00',
  operatingHoursClose: '23:00',
  defaultTableDuration: 60,     // minutos
  taxRate: 16,                  // 16% en México
  defaultTipPercentages: [10, 15, 20],
  maxTableCapacity: 50,
  deliveryEnabled: true,
  onlineOrderingEnabled: false, // Fase 2
  reservationsEnabled: false    // Fase 2
}
```

---

## 🗂️ ESTRUCTURA DE MÓDULOS

### CONSERVADOS (AtlasERP → AtlasRestaurant)

- ✅ `auth` - Autenticación JWT
- ✅ `users` - Gestión de usuarios (con roles nuevos)
- ✅ `restaurants` - Datos del restaurante (fue `companies`)
- ✅ `invoicing` - Facturación CFDI
- ✅ `reports` - Reportes adaptados
- ✅ `payments` - Procesamiento de pagos

### NUEVOS

- 🆕 `menu` - Gestión de platillos (fue `products`)
- 🆕 `tables` - Sistema de mesas
- 🆕 `orders` - Órdenes (fue `sales`)
- 🆕 `kitchen` - Kitchen Display
- 🆕 `delivery` - Entregas a domicilio
- 🆕 `customers` - Clientes y lealtad
- 🆕 `cash-sessions` - Cierre de caja
- 🆕 `refunds` - Devoluciones

### ELIMINADOS

- ❌ `purchases` - No necesario
- ❌ `transfers` - Única sucursal
- ❌ `inventory` (mayoría) - Solo stock básico

---

## 🚢 ROADMAP

### **Fase 1: MVP (Mes 1-2)** ✓ EN CURSO

- [x] Estructura base del proyecto
- [ ] Módulo de menú
- [ ] Sistema de mesas
- [ ] Órdenes y pagos básicos
- [ ] Kitchen Display
- [ ] Modo offline

### **Fase 2: Expansión (Mes 3-4)**

- [ ] Entregas a domicilio (completo)
- [ ] Reservas
- [ ] Programa de lealtad
- [ ] Reportes avanzados
- [ ] Multi-sucursal (opcional)

### **Fase 3: Premium (Mes 5+)**

- [ ] Integración de APIs (Uber Eats, DoorDash)
- [ ] GPS en tiempo real repartidores
- [ ] Órdenes online
- [ ] Análisis de datos (BI)
- [ ] Personalización de UI

---

## 📞 SOPORTE

Para reportar bugs o sugerencias:
- GitHub Issues: [tu-repo/atlas-restaurant/issues](https://github.com/tu-usuario/atlas-restaurant/issues)
- Email: soporte@atlasrestaurant.com

---

## 📄 LICENCIA

MIT License - Ver LICENSE.md

---

**Última actualización:** 29 de Diciembre de 2025
