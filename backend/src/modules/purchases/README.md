# 📦 Módulo de Compras - AtlasERP

## ✅ Estado de Implementación

- ✅ Entidades creadas (Purchase, PurchaseItem, Supplier)
- ✅ DTOs con validaciones
- ✅ Servicios implementados
- ✅ Endpoints REST expuestos
- ✅ Migraciones ejecutadas
- ✅ Datos de prueba insertados

## 🚀 Endpoints Disponibles

### Proveedores

#### Crear Proveedor
```bash
POST http://localhost:3000/api/purchases/suppliers
Content-Type: application/json

{
  "code": "SUP-004",
  "businessName": "Nuevo Proveedor S.A.",
  "tradeName": "Nuevo Proveedor",
  "rfc": "NPR123456ABC",
  "contactName": "Pedro García",
  "email": "contacto@nuevoproveedor.com",
  "phone": "3312345678",
  "creditLimit": 25000,
  "creditDays": 20,
  "rating": 4
}
```

#### Listar Proveedores
```bash
GET http://localhost:3000/api/purchases/suppliers
GET http://localhost:3000/api/purchases/suppliers?q=carnes&limit=10
```

### Compras

#### Crear Orden de Compra
```bash
POST http://localhost:3000/api/purchases
Content-Type: application/json

{
  "branchId": 1,
  "warehouseId": 1,
  "supplierId": 1,
  "orderDate": "2025-11-27",
  "expectedDeliveryDate": "2025-12-02",
  "supplierInvoice": "FACT-001",
  "paymentTerms": "30 días",
  "dueDate": "2025-12-27",
  "notes": "Compra urgente para restock",
  "items": [
    {
      "productId": 1,
      "quantityOrdered": 50,
      "unitCost": 180.50,
      "taxRate": 16,
      "discountPercentage": 5
    }
  ]
}
```

#### Listar Compras
```bash
# Todas las compras
GET http://localhost:3000/api/purchases

# Con filtros
GET http://localhost:3000/api/purchases?page=1&limit=20&status=DRAFT
GET http://localhost:3000/api/purchases?supplierId=1
```

#### Aprobar Compra
```bash
POST http://localhost:3000/api/purchases/1/approve
```

#### Recibir Mercancía
```bash
POST http://localhost:3000/api/purchases/1/receive
Content-Type: application/json

{
  "receivedDate": "2025-11-28",
  "notes": "Mercancía recibida en buen estado",
  "items": [
    {
      "purchaseItemId": 1,
      "quantityReceived": 50,
      "lotNumber": "LOT-2025-001",
      "expiryDate": "2026-05-28"
    }
  ]
}
```

#### Compras por Proveedor
```bash
GET http://localhost:3000/api/purchases/supplier/1
```

## 🔄 Flujo Completo de Compra

### 1. Crear Proveedor (si no existe)
```bash
curl -X POST http://localhost:3000/api/purchases/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SUP-TEST",
    "businessName": "Proveedor de Prueba",
    "creditLimit": 10000
  }'
```

### 2. Crear Orden de Compra (estado: DRAFT)
```bash
curl -X POST http://localhost:3000/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": 1,
    "warehouseId": 1,
    "supplierId": 1,
    "orderDate": "2025-11-27",
    "items": [
      {
        "productId": 1,
        "quantityOrdered": 100,
        "unitCost": 150.00,
        "taxRate": 16
      }
    ]
  }'
```

### 3. Aprobar Compra (estado: SENT)
```bash
curl -X POST http://localhost:3000/api/purchases/1/approve
```

### 4. Recibir Mercancía (estado: RECEIVED)
```bash
curl -X POST http://localhost:3000/api/purchases/1/receive \
  -H "Content-Type: application/json" \
  -d '{
    "receivedDate": "2025-11-28",
    "items": [
      {
        "purchaseItemId": 1,
        "quantityReceived": 100,
        "lotNumber": "LOT-2025-TEST",
        "expiryDate": "2026-06-01"
      }
    ]
  }'
```

## 🎯 Qué Hace Automáticamente al Recibir

1. ✅ Valida cantidad recibida vs ordenada
2. ✅ Crea lote en inventario con `InventoryService.createLot()`
3. ✅ Registra movimiento de tipo `PURCHASE` con `InventoryService.createMovement()`
4. ✅ Actualiza `quantity_received` en `purchase_items`
5. ✅ Cambia estado de compra a `PARTIAL` o `RECEIVED`
6. ✅ Actualiza fecha de recepción

## 📊 Datos de Prueba

### Proveedores Insertados
- **SUP-001**: Carnes Selectas S.A. (límite: $50,000)
- **SUP-002**: Distribuidora de Alimentos del Norte (límite: $30,000)
- **SUP-003**: Proveedora de Insumos GDL (límite: $20,000)

### Compra de Prueba
- **PUR-2411-0001**: Orden en estado DRAFT por $17,400

## 🔧 Próximos Pasos

1. **Frontend**: Crear páginas para:
   - Lista de proveedores
   - Formulario de proveedores
   - Lista de compras
   - Formulario de compras
   - Recepción de mercancía

2. **Reportes**: Agregar endpoints para:
   - Reporte de compras por período
   - Compras por proveedor
   - Análisis de costos

3. **Autenticación**: Integrar `@CurrentUser()` decorator para capturar el `userId` real en lugar del hardcoded `0`

4. **Validaciones**: Agregar validaciones de negocio:
   - Límite de crédito del proveedor
   - Productos activos
   - Almacenes activos

## 🐛 Depuración

Ver logs del backend:
```bash
cd /home/cesar/Documents/AtlasERP/backend
npm run start:dev
```

Consultar datos directamente:
```bash
PGPASSWORD='0MnJh+lH14xQ6+Rni6Eh6g==' psql -U postgres -d erp_carniceria

-- Ver proveedores
SELECT * FROM suppliers;

-- Ver compras
SELECT * FROM purchases;

-- Ver items de compra
SELECT * FROM purchase_items;

-- Ver lotes creados por compras
SELECT * FROM inventory_lots WHERE lot_number LIKE 'LOT-%';
```

## ✨ Siguientes Funcionalidades

- [ ] Cancelación de compras
- [ ] Devoluciones a proveedor
- [ ] Cuentas por pagar
- [ ] Notas de crédito
- [ ] Integración con contabilidad
