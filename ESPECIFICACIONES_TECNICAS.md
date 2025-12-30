# 📋 ESPECIFICACIONES TÉCNICAS - AtlasRestaurant

**Documento de Especificaciones Técnicas Detalladas**  
**Fecha:** 29 de Diciembre de 2025  
**Versión:** 1.0.0

---

## 📊 RESUMEN EJECUTIVO

AtlasRestaurant es un sistema POS especializado para restaurantes de 1 sucursal con capacidad para:
- **10 usuarios máximo** por sucursal
- **50 mesas máximo**
- **Modo offline completo** con sincronización en la nube
- **Múltiples cuentas por mesa** (ticket por cliente)
- **Entregas propias + integraciones** con plataformas
- **Facturación CFDI 4.0** bajo demanda

---

## 🎯 REQUERIMIENTOS OPERACIONALES (FINALES)

### 1. SISTEMA DE MESAS Y ÓRDENES

**Modelo: Múltiples Cuentas por Mesa**

```
Mesa 4
├── Cuenta 1 (César)
│   ├── Caldo de Res (1)      → $150
│   ├── Agua Fresca (2)       → $30
│   └── Subtotal              → $180
│
├── Cuenta 2 (Karla)
│   ├── Enchiladas (1)        → $120
│   ├── Cerveza (2)           → $80
│   └── Subtotal              → $200
│
└── Cuenta 3 (Emiliano)
    ├── Cochinita Pibil (1)   → $200
    ├── Café (1)              → $45
    └── Subtotal              → $245
```

**Características:**
- Una orden principal por mesa
- Múltiples "tickets" (cuentas) dentro de la misma orden
- Cada ticket tiene nombre del cliente
- Pago independiente por ticket
- Control de quién ordena qué

**Entidades Base:**

```typescript
// Order (Orden principal de mesa)
@Entity('orders')
export class Order {
  id: uuid;
  branchId: uuid;
  tableId: uuid;
  orderNumber: string;        // Ej: "ORD-20251229-001"
  
  status: 'pending' | 'in_kitchen' | 'ready' | 'served' | 'paid' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid';
  
  orderDate: timestamp;
  sentToKitchenAt: timestamp;
  readyAt: timestamp;
  servedAt: timestamp;
  paidAt: timestamp;
  
  subtotal: decimal;
  taxAmount: decimal;
  discountAmount: decimal;
  totalAmount: decimal;
  
  waiterId: uuid;              // Mesero asignado
  notes: text;
  
  orderTickets: OrderTicket[]; // Cuentas dentro de esta orden
}

// OrderTicket (Cuenta del cliente)
@Entity('order_tickets')
export class OrderTicket {
  id: uuid;
  orderId: uuid;
  
  ticketNumber: string;        // Ej: "TKT-001", "TKT-002"
  customerName: string;        // Nombre de quien paga este ticket
  
  status: 'pending' | 'paid' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid';
  
  subtotal: decimal;
  taxAmount: decimal;
  discountAmount: decimal;
  tipAmount: decimal;
  totalAmount: decimal;
  
  items: OrderTicketItem[];    // Platillos de este ticket
  payments: Payment[];         // Pagos de este ticket
}

// OrderTicketItem (Platillo dentro de un ticket)
@Entity('order_ticket_items')
export class OrderTicketItem {
  id: uuid;
  ticketId: uuid;
  menuItemId: uuid;
  
  itemName: string;
  basePrice: decimal;
  quantity: int;
  specialInstructions: text;   // "Sin cebolla", "Extra queso"
  
  subtotal: decimal;
  status: 'pending' | 'ready' | 'served';
  
  createdAt: timestamp;
  readyAt: timestamp;
}
```

---

### 2. SISTEMA DE PAGOS

**Métodos Soportados: Efectivo + Tarjetas**

**Tarjetas Integradas:**
- Stripe
- Mercado Pago
- Conekta (recomendado para México)
- PayPal (opcional)

```typescript
@Entity('payments')
export class Payment {
  id: uuid;
  ticketId: uuid;
  
  amount: decimal;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'qr';
  
  // Si es tarjeta
  cardBrand?: 'visa' | 'mastercard' | 'amex';
  cardLast4?: string;
  cardAuthorizationCode?: string;
  processor?: 'stripe' | 'mercadopago' | 'conekta';
  processorTransactionId?: string;
  
  // Si es QR
  qrType?: 'spei' | 'other';
  
  // Propina
  tipAmount: decimal;          // Propina incluida en este pago
  tipType: 'fixed' | 'percentage';
  
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
  
  processedAt: timestamp;
  receiptUrl: string;          // URL del comprobante
}
```

**Propinas:**
- ✅ Monto fijo (ej: $100)
- ✅ Porcentaje (ej: 10%, 15%, 20%)
- ✅ Ambas opciones disponibles en UI

---

### 3. ENTREGAS A DOMICILIO

**Modelo: Híbrido (Propios + Integraciones)**

```typescript
@Entity('delivery_orders')
export class DeliveryOrder {
  id: uuid;
  orderId: uuid;
  
  // Dirección
  addressLine: string;
  neighborhood: string;
  city: string;
  zipCode: string;
  deliveryNotes: text;
  
  // Repartidor
  deliveryPersonId?: uuid;     // NULL si es plataforma
  deliveryPerson?: User;
  phone: string;
  
  // Timeline
  assignedAt: timestamp;
  pickedUpAt: timestamp;
  arrivedAt: timestamp;
  deliveredAt: timestamp;
  
  // Costos
  deliveryFee: decimal;
  estimatedDeliveryTime: int;  // minutos
  actualDeliveryTime: int;
  
  // Plataforma
  isIntegrated: boolean;       // true si es Uber/DoorDash
  platformName?: string;       // 'uber_eats', 'doordash'
  platformOrderId?: string;
  
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  
  // Fase 2: GPS
  // lastKnownLocation: geometry;
  // gpsTracking: boolean;
}
```

**Integraciones Planeadas:**
- 🔄 Uber Eats API
- 🔄 DoorDash API
- 🔄 Rappi API (opcional)

---

### 4. FACTURACIÓN CFDI 4.0

**Opción: Bajo Demanda**

```typescript
@Entity('cfdi_invoices')
export class CFDIInvoice {
  id: uuid;
  orderId: uuid;
  
  folio: string;               // RFC-2024-000001
  uuid: uuid;                  // UUID del CFDI
  
  // Datos del cliente
  customerName: string;
  customerRFC: string;         // Opcional
  customerEmail: string;
  
  // Detalles
  issueDate: timestamp;
  items: InvoiceLineItem[];
  
  subtotal: decimal;
  taxAmount: decimal;
  discountAmount: decimal;
  total: decimal;
  
  // Firmado
  certificatePath: string;
  signedXML: text;
  satStatus: 'pending' | 'valid' | 'cancelled';
  satValidation: timestamp;
  
  // Global (múltiples órdenes)
  isGlobal: boolean;
  relatedOrders: uuid[];       // Órdenes incluidas en esta factura
}
```

**Características:**
- ✅ Factura por orden
- ✅ Factura global (resumen de varias órdenes)
- ✅ Bajo demanda (cliente pide en el momento)
- ✅ Envío automático por email

---

### 5. KITCHEN DISPLAY SYSTEM (KDS)

**Monitor de Cocina - Información Crítica**

```typescript
@Entity('kitchen_orders')
export class KitchenOrder {
  id: uuid;
  orderId: uuid;
  
  // Identificación visual
  orderNumber: string;         // "ORD-001"
  tableNumber: int;            // Mesa 4
  customerName?: string;       // Nombre del cliente en mesa
  
  // Información de preparación
  items: KitchenItem[];
  
  // Tiempos
  createdAt: timestamp;
  sentToKitchenAt: timestamp;
  targetReadyTime: timestamp;  // Tiempo esperado
  actualReadyTime: timestamp;
  
  // Estado
  status: 'new' | 'in_progress' | 'ready' | 'served';
  
  // Prioridad (Fase 2)
  // priority: 'normal' | 'high' | 'vip';
  
  // Cambios
  modifications: KitchenModification[];
}

@Entity('kitchen_items')
export class KitchenItem {
  id: uuid;
  kitchenOrderId: uuid;
  
  itemName: string;            // "Caldo de Res"
  quantity: int;
  
  // Información crítica para cocina
  ingredients: string[];       // Lista de ingredientes
  specialInstructions: text;   // "Sin cebolla, extra cilantro"
  
  status: 'pending' | 'in_progress' | 'ready' | 'served';
  
  createdAt: timestamp;
  startedAt: timestamp;
  readyAt: timestamp;
}

@Entity('kitchen_modifications')
export class KitchenModification {
  id: uuid;
  kitchenOrderId: uuid;
  
  type: 'new_item' | 'removed_item' | 'instruction_change' | 'priority_change';
  description: text;
  
  modifiedBy: uuid;
  modifiedAt: timestamp;
}
```

**UI del Monitor:**
```
┌─────────────────────────────────────────┐
│ KITCHEN DISPLAY - NUEVA ORDEN           │
├─────────────────────────────────────────┤
│                                         │
│ Mesa: 4           Hora: 14:23           │
│ Orden: ORD-001    Cliente: César        │
│                                         │
│ ────────────────────────────────────────│
│ □ Caldo de Res (1)                      │
│   Ingredientes: Caldo, Verduras, Carne  │
│   Instrucciones: Sin cebolla            │
│   Tiempo est: 12 min                    │
│                                         │
│ □ Agua Fresca (2)                       │
│   Instrucciones: Bien fría              │
│   Tiempo est: 3 min                     │
│                                         │
│ [PREPARANDO]     [LISTO]   [CANCELAR]  │
└─────────────────────────────────────────┘
```

---

### 6. MODO OFFLINE

**Arquitectura: Sincronización Bidireccional**

```typescript
// Estrategia: Service Worker + SQLite Local + Sincronización

// Estructura local (SQLite)
@LocalDatabase('atlas_restaurant.db')
export class LocalOfflineDB {
  // Tablas replicadas localmente
  menu_items: MenuItem[];
  orders: Order[];
  order_tickets: OrderTicket[];
  customers: Customer[];
  tables: Table[];
  
  // Metadata de sincronización
  sync_metadata: {
    lastSyncAt: timestamp;
    pendingChanges: SyncChange[];
    conflictedChanges: ConflictedChange[];
  };
}

// Cambios pendientes
@Entity('sync_changes')
export class SyncChange {
  id: uuid;
  entityType: string;         // 'Order', 'OrderTicket', 'Payment'
  entityId: uuid;
  
  operation: 'create' | 'update' | 'delete';
  payload: jsonb;             // Datos antes/después
  
  createdOfflineAt: timestamp;
  syncedAt?: timestamp;
  
  status: 'pending' | 'synced' | 'conflict';
}

// Estrategia de sincronización
async function syncWithServer() {
  // 1. Obtener cambios locales pendientes
  const changes = await getLocalChanges();
  
  // 2. Enviar a servidor
  const syncResult = await uploadToServer(changes);
  
  // 3. Descargar cambios remotos
  const remoteChanges = await downloadFromServer();
  
  // 4. Aplicar cambios remotos localmente
  await mergeRemoteChanges(remoteChanges);
  
  // 5. Resolver conflictos (último write gana)
  await resolveConflicts();
  
  // 6. Marcar como sincronizado
  await markAsSynced();
}

// Resolución de conflictos
export enum ConflictResolution {
  LAST_WRITE_WINS = 'lww',      // Timestamp más reciente gana
  SERVER_WINS = 'server',       // Cambios del servidor ganan
  LOCAL_WINS = 'local',         // Cambios locales ganan
  MANUAL = 'manual'             // Usuario elige
}
```

**Características:**
- ✅ Toda la app funciona sin internet
- ✅ Menú se descarga localmente
- ✅ Órdenes se crean/pagan localmente
- ✅ Sincronización automática cuando hay conexión
- ✅ Resolución de conflictos inteligente
- ✅ No se pierden datos

**Tecnología:**
- Service Worker para caché
- SQLite (o IndexedDB) en terminal
- Queue de sincronización
- Event listeners para cambios de conectividad

---

### 7. SESIÓN DE CAJA (CASH SESSION)

**Flujo: Apertura → Venta → Cierre Manual**

```typescript
@Entity('cash_sessions')
export class CashSession {
  id: uuid;
  branchId: uuid;
  
  cashierId: uuid;             // Quién abrió la caja
  openedBy: User;
  
  openedAt: timestamp;
  closedAt: timestamp;
  
  // Saldos
  openingBalance: decimal;     // Balance inicial declarado
  closingBalance: decimal;     // Balance final declarado
  
  // Totales de venta
  totalCash: decimal;          // Total en efectivo del día
  totalCard: decimal;          // Total en tarjeta del día
  totalTransfer: decimal;      // Total en transferencias del día
  
  // Reconciliación
  expectedCash: decimal;       // openingBalance + pagos en efectivo
  actualCash: decimal;         // Lo que hay realmente
  discrepancy: decimal;        // Diferencia
  discrepancyReason: text;     // Explicación si hay diferencia
  
  status: 'open' | 'closing' | 'closed' | 'audited';
  
  // Auditoría
  auditedBy?: uuid;
  auditNotes?: text;
}

// Detalle de movimientos (para auditoría)
@Entity('cash_movements')
export class CashMovement {
  id: uuid;
  sessionId: uuid;
  
  movementType: 'payment' | 'refund' | 'adjustment' | 'withdrawal';
  amount: decimal;
  
  relatedPaymentId?: uuid;
  relatedRefundId?: uuid;
  
  description: text;
  
  recordedBy: uuid;
  recordedAt: timestamp;
}
```

**Proceso:**

```
1. APERTURA (Mañana)
   ├── Cajero elige: Caja nueva o caja anterior
   ├── Ingresa: Saldo inicial (ej: $5,000)
   └── Status: OPEN

2. OPERACIÓN (Durante el día)
   ├── Pagos en efectivo → Cash Movement (payment)
   ├── Devoluciones → Cash Movement (refund)
   └── Ajustes → Cash Movement (adjustment)

3. CIERRE (Noche)
   ├── Cajero declara: Monto físico en caja
   ├── Sistema calcula:
   │   - Esperado: saldo inicial + pagos - devoluciones
   │   - Real: lo declarado
   │   - Diferencia: real - esperado
   ├── Si diferencia < $100: Cierre automático
   ├── Si diferencia > $100: Requiere nota explicativa
   └── Status: CLOSED

4. AUDITORÍA (Opcional - Siguiente día)
   ├── Gerente revisa movimientos
   ├── Aprueba o rechaza
   └── Status: AUDITED
```

---

### 8. DEVOLUCIONES Y REEMBOLSOS

```typescript
@Entity('order_refunds')
export class OrderRefund {
  id: uuid;
  ticketId: uuid;
  
  // Motivo
  refundReason: 'quality' | 'customer_request' | 'mistake' | 'system_error';
  refundDescription: text;
  
  // Items
  refundedItems: RefundedItem[];  // Qué se devuelve
  
  // Dinero
  refundAmount: decimal;
  
  // Método de devolución
  refundPaymentMethod: 'cash' | 'card' | 'credit_to_account';
  
  // Aprobaciones
  requestedBy: uuid;           // Quién solicita (ej: Mesero)
  approvedBy?: uuid;           // Quién autoriza (ej: Gerente)
  
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  
  createdAt: timestamp;
  approvedAt?: timestamp;
  completedAt?: timestamp;
  
  notes: text;
  attachments?: string[];      // Fotos del producto defectuoso
}

@Entity('refunded_items')
export class RefundedItem {
  id: uuid;
  refundId: uuid;
  
  originalItemId: uuid;
  itemName: string;
  quantity: int;
  refundAmount: decimal;
}
```

---

### 9. SISTEMA DE ROLES Y PERMISOS

**Roles Definidos:**

```typescript
export enum UserRole {
  ADMIN = 'ADMIN',                    // Control total
  MANAGER = 'MANAGER',                // Gerente
  CASHIER = 'CASHIER',                // Cajero
  WAITER = 'WAITER',                  // Mesero
  COOK = 'COOK',                      // Cocinero
  BARMAN = 'BARMAN',                  // Barman
  DELIVERY = 'DELIVERY'               // Repartidor
}

// Permisos granulares
export enum Permission {
  // Órdenes
  ORDER_CREATE = 'order:create',
  ORDER_MODIFY = 'order:modify',
  ORDER_MODIFY_OWN = 'order:modify:own',
  ORDER_CANCEL = 'order:cancel',
  ORDER_VIEW_ALL = 'order:view:all',
  ORDER_VIEW_OWN = 'order:view:own',
  
  // Pagos
  PAYMENT_PROCESS = 'payment:process',
  PAYMENT_VIEW = 'payment:view',
  
  // Reembolsos
  REFUND_REQUEST = 'refund:request',
  REFUND_APPROVE = 'refund:approve',
  
  // Caja
  CASH_SESSION_OPEN = 'cash:session:open',
  CASH_SESSION_CLOSE = 'cash:session:close',
  CASH_SESSION_VIEW_ALL = 'cash:session:view:all',
  CASH_MOVEMENT_VIEW = 'cash:movement:view',
  
  // Kitchen
  KITCHEN_VIEW = 'kitchen:view',
  KITCHEN_MARK_READY = 'kitchen:mark:ready',
  KITCHEN_MODIFY_ORDER = 'kitchen:modify:order',
  
  // Menú
  MENU_VIEW = 'menu:view',
  MENU_CREATE = 'menu:create',
  MENU_UPDATE = 'menu:update',
  MENU_DELETE = 'menu:delete',
  
  // Mesas
  TABLE_MANAGE = 'table:manage',
  TABLE_VIEW = 'table:view',
  
  // Reportes
  REPORT_VIEW = 'report:view',
  REPORT_FINANCIAL = 'report:financial',
  
  // Usuarios
  USER_MANAGE = 'user:manage',
  
  // Entregas
  DELIVERY_ASSIGN = 'delivery:assign',
  DELIVERY_TRACK = 'delivery:track',
  DELIVERY_UPDATE_STATUS = 'delivery:update:status',
}

// Matriz de permisos por rol
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Todos los permisos
    ...Object.values(Permission)
  ],
  
  [UserRole.MANAGER]: [
    ORDER_VIEW_ALL,
    PAYMENT_VIEW,
    REFUND_APPROVE,
    CASH_SESSION_VIEW_ALL,
    CASH_MOVEMENT_VIEW,
    KITCHEN_VIEW,
    MENU_VIEW,
    TABLE_VIEW,
    REPORT_VIEW,
    REPORT_FINANCIAL,
    DELIVERY_TRACK,
  ],
  
  [UserRole.CASHIER]: [
    PAYMENT_PROCESS,
    PAYMENT_VIEW,
    REFUND_REQUEST,
    CASH_SESSION_OPEN,
    CASH_SESSION_CLOSE,
    ORDER_VIEW_ALL,
    DELIVERY_TRACK,
  ],
  
  [UserRole.WAITER]: [
    ORDER_CREATE,
    ORDER_MODIFY_OWN,
    ORDER_VIEW_OWN,
    TABLE_VIEW,
    REFUND_REQUEST,
    KITCHEN_VIEW,
  ],
  
  [UserRole.COOK]: [
    KITCHEN_VIEW,
    KITCHEN_MARK_READY,
    KITCHEN_MODIFY_ORDER,
  ],
  
  [UserRole.BARMAN]: [
    ORDER_VIEW_ALL,
    ORDER_MODIFY_OWN,
    KITCHEN_VIEW,
    KITCHEN_MARK_READY,
  ],
  
  [UserRole.DELIVERY]: [
    DELIVERY_UPDATE_STATUS,
    ORDER_VIEW_OWN,
  ],
};
```

---

### 10. CONFIGURACIÓN DE RESTAURANTE

```typescript
@Entity('restaurant_settings')
export class RestaurantSettings {
  id: uuid;
  restaurantId: uuid;
  branchId: uuid;
  
  // Operación
  operatingHoursOpen: time;        // "10:00"
  operatingHoursClose: time;       // "23:00"
  defaultTableDuration: int;       // 60 minutos
  
  // Impuestos (México)
  taxRate: decimal;                // 16.0
  serviceChargeRate: decimal;      // 0.0 (opcional)
  defaultTipPercentages: int[];    // [10, 15, 20]
  
  // Límites
  maxItemsPerOrder: int;           // 999 (sin límite)
  minOrderValue: decimal;          // 0
  
  // Kitchen
  kitchenNotificationTime: int;    // 5 minutos antes de notificar
  defaultPrepTime: int;            // Minutos default por platillo
  
  // Entregas
  deliveryEnabled: boolean;        // true
  deliveryFeeModeFixed: boolean;   // true = fijo, false = por km
  deliveryFeeAmount: decimal;      // $50 fijo o $5 por km
  maxDeliveryRadius: int;          // 15 km
  
  // Plataformas
  uberEatsEnabled: boolean;
  doordashEnabled: boolean;
  rappiEnabled: boolean;
  
  // Features (Fase 1 vs 2)
  reservationsEnabled: boolean;    // false (Fase 2)
  onlineOrderingEnabled: boolean;  // false (Fase 2)
  enableLoyalty: boolean;          // false (Fase 2)
  enableTableMerging: boolean;     // false
  enableSplitPayment: boolean;     // true
  
  // Facturación CFDI
  cfdiEnabled: boolean;            // true
  requireCFDIEmail: boolean;       // false
  routerKey: string;               // Clave del enrutador
  certificatePath: string;         // Path del certificado
  
  // Sincronización
  syncIntervalMinutes: int;        // 5 minutos
  backupIntervalHours: int;        // 24 horas
}
```

---

## 🗄️ ESQUEMA DE BASE DE DATOS

### Entidades Principales

```
restaurants
├── branches
├── users
├── roles_permissions
│
├── menu_categories
├── menu_items
├── menu_item_modifiers
│
├── tables
├── zones
│
├── orders
├── order_tickets
├── order_ticket_items
├── order_modifications
│
├── payments
├── payment_processors
│
├── order_refunds
├── refunded_items
│
├── delivery_orders
├── delivery_persons
│
├── cash_sessions
├── cash_movements
│
├── kitchen_orders
├── kitchen_items
├── kitchen_modifications
│
├── invoices (CFDI)
├── invoice_items
│
├── customers
├── customer_addresses
├── loyalty_points (Fase 2)
│
├── audit_logs
├── sync_changes
│
└── restaurant_settings
```

---

## 🔐 SEGURIDAD

### Autenticación

- ✅ JWT con refresh tokens
- ✅ Sesiones con expiración
- ✅ 2FA (Fase 2)

### Encriptación

- ✅ Passwords con bcrypt
- ✅ Datos sensibles (tarjetas) con AES-256
- ✅ HTTPS/TLS en todas las comunicaciones

### Auditoría

- ✅ Todos los cambios logged
- ✅ IP y User-Agent registrados
- ✅ Motivos de cambios críticos
- ✅ Retención de 1 año

---

## 📱 PLATAFORMAS

### Backend
- **Framework:** NestJS 10+
- **BD:** PostgreSQL 12+
- **Cache:** Redis (opcional)
- **Queue:** Bull (procesamiento de tareas)
- **Validación:** Class Validator
- **Documentación:** Swagger/OpenAPI

### Frontend (Admin/Manager)
- **Framework:** React 18+
- **Build:** Vite
- **UI:** Material-UI o Chakra-UI
- **State:** Zustand o Redux Toolkit
- **HTTP:** Axios

### POS Terminal
- **Framework:** React 18+ o Electron
- **Optimización:** Pantalla táctil
- **Offline:** Service Workers + SQLite
- **Impresora:** Thermal Printer Library

### Mobile (Comandera - Fase 2)
- **Framework:** React Native / PWA
- **Offline:** Service Workers
- **Sincronización:** Background Sync API

---

## 📈 ESCALABILIDAD

### Fase 1
- 1 sucursal
- 10 usuarios
- 50 mesas
- ~100 órdenes/día

### Fase 2+
- Multi-sucursal (opcional)
- Escalabilidad horizontal (carga)
- Replicación de BD
- CDN para assets

---

## 🚀 HITOS

| Hito | Fecha Est. | Descripción |
|------|-----------|-------------|
| **v0.1** | Feb 2025 | Menu, Órdenes, Pagos básicos |
| **v0.2** | Mar 2025 | Kitchen Display, Offline |
| **v0.3** | Abr 2025 | Entregas, Facturación |
| **v1.0** | May 2025 | MVP completo |

---

**Documento creado:** 29 de Diciembre de 2025  
**Siguiente revisión:** 02 de Enero de 2026
