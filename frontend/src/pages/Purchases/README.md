# 🎨 Frontend - Módulo de Compras

## ✅ Implementado

### Páginas Creadas
- ✅ **SuppliersList** - Lista de proveedores con estadísticas
- ✅ **SupplierForm** - Formulario completo para crear proveedores
- ✅ **PurchasesList** - Lista de órdenes de compra con filtros
- ✅ **PurchaseForm** - Formulario dinámico para crear compras

### Características

#### Proveedores (`/suppliers`)
- 📊 Tarjetas estadísticas (Total, Activos, Límite Crédito, Deuda)
- 🔍 Búsqueda por nombre o razón social
- ➕ Crear nuevo proveedor con validaciones
- 📋 Tabla con información completa
- ⭐ Sistema de calificación (1-5 estrellas)
- 💰 Visualización de límites de crédito y deuda actual

#### Órdenes de Compra (`/purchases`)
- 📊 Estadísticas (Total, Borradores, Recibidas, Monto Total)
- 🏷️ Estados con colores: DRAFT, SENT, PARTIAL, RECEIVED, CANCELLED
- 🔽 Filtro por estado
- ➕ Crear nueva orden de compra
- 📝 Formulario dinámico:
  - Selección de proveedor y almacén
  - Fechas (orden, entrega, vencimiento)
  - Agregar múltiples productos
  - Cálculo automático de totales (subtotal, impuestos, descuentos)
  - Validaciones en tiempo real

### Rutas Agregadas
```tsx
/suppliers              → Lista de proveedores
/purchases              → Lista de órdenes de compra
/purchases/new          → Crear nueva orden de compra
```

### Menú Actualizado
Nuevo ítem en el sidebar:
```
🛒 Compras
  ├── 🏪 Proveedores
  └── 🛒 Órdenes de Compra
```

## 🚀 Cómo Probar

### 1. Iniciar Servicios
```bash
# Terminal 1: Backend
cd /home/cesar/Documents/AtlasERP/backend
npm run start:dev

# Terminal 2: Frontend
cd /home/cesar/Documents/AtlasERP/frontend
npm run dev
```

### 2. Acceder a la Aplicación
- URL: http://localhost:5173
- Usuario: `admin`
- Contraseña: la que configuraste

### 3. Probar Flujo Completo

#### A) Crear Proveedor
1. Ir a **Compras** → **Proveedores**
2. Click en **"Nuevo Proveedor"**
3. Llenar el formulario:
   - Código: `SUP-TEST-001`
   - Razón Social: `Mi Proveedor de Prueba S.A.`
   - Nombre Comercial: `Mi Proveedor`
   - RFC: `MPR123456ABC`
   - Contacto: `Juan Pérez`
   - Email: `contacto@miproveedor.com`
   - Teléfono: `3312345678`
   - Límite de Crédito: `$50,000`
   - Calificación: ⭐⭐⭐⭐⭐
4. Click en **"Guardar"**
5. Verificar que aparece en la lista

#### B) Crear Orden de Compra
1. Ir a **Compras** → **Órdenes de Compra**
2. Click en **"Nueva Compra"**
3. Llenar datos generales:
   - Proveedor: Seleccionar el creado
   - Almacén: Seleccionar almacén existente
   - Fecha de Orden: Hoy
   - Términos de Pago: `30 días`
4. Agregar productos:
   - Click en **"Agregar Producto"**
   - Buscar y seleccionar producto
   - Cantidad: `50`
   - Costo Unitario: `$180.50`
   - Impuesto: `16%`
   - Descuento: `5%` (opcional)
5. Verificar cálculos automáticos en tiempo real
6. Click en **"Guardar Compra"**
7. Verificar que aparece en la lista con estado "📝 Borrador"

#### C) Próximo: Aprobar y Recibir
(Funcionalidad pendiente de implementar en el frontend)
- Botón "Aprobar" para cambiar estado a SENT
- Modal "Recibir" para capturar lotes y crear inventario

## 📝 Campos del Formulario de Proveedor

### Información Básica
- **Código*** (32 chars): Identificador único
- **Razón Social*** (128 chars): Nombre legal
- **Nombre Comercial** (128 chars): Nombre de fantasía
- **RFC** (12-13 chars): Registro fiscal

### Contacto
- **Nombre de Contacto**
- **Email** (validado)
- **Teléfono**
- **Celular**

### Dirección
- **Calle**
- **Ciudad**
- **Estado**
- **Código Postal**

### Términos Comerciales
- **Términos de Pago** (ej: "30 días")
- **Días de Crédito** (0-180)
- **Límite de Crédito** (numérico con formato)
- **Calificación** (1-5 estrellas)
- **Notas** (textarea)

## 📝 Campos del Formulario de Compra

### Encabezado
- **Proveedor*** (select con búsqueda)
- **Almacén*** (select)
- **Fecha de Orden*** (date picker)
- **Fecha Entrega Esperada** (date picker)
- **Factura Proveedor** (64 chars)
- **Términos de Pago** (64 chars)
- **Fecha de Vencimiento** (date picker)
- **Notas** (textarea)

### Items (Tabla Dinámica)
Por cada producto:
- **Producto*** (select con búsqueda)
- **Cantidad*** (number)
- **Costo Unitario*** (currency)
- **Impuesto %** (0-100)
- **Descuento %** (0-100)
- **Total** (calculado automáticamente)
- **Botón Eliminar**

### Totales Calculados
- Subtotal
- Descuento (si aplica)
- Impuestos
- **Total General**

## 🎨 Componentes Reutilizables

### API Service (`services/purchasesApi.ts`)
```typescript
getSuppliers(params)           // Lista paginada
searchSuppliers(q, limit)      // Búsqueda rápida
createSupplier(data)           // Crear proveedor
getSupplierPurchases(id)       // Compras de un proveedor

getPurchases(params)           // Lista paginada con filtros
createPurchase(data)           // Crear orden de compra
approvePurchase(id)            // Aprobar compra
receivePurchase(id, data)      // Recibir mercancía
```

### Estilos y UX
- 🎨 Ant Design components
- 📱 Responsive (breakpoint lg)
- 🎯 Validaciones en tiempo real
- 💰 Formato de moneda con separadores
- 📊 Cards con estadísticas
- 🏷️ Tags con colores semánticos
- 🔍 Búsqueda con debounce
- ⚡ Loading states

## 🐛 Troubleshooting

### Error: Cannot find module 'dayjs'
```bash
cd /home/cesar/Documents/AtlasERP/frontend
npm install dayjs
```

### Error: Cannot find 'searchProducts'
Verificar que `productsApi.ts` exporta `searchProducts`:
```typescript
export const searchProducts = (query: string) => {
  return api.get(`/products/search?q=${encodeURIComponent(query)}`);
};
```

### Error: Cannot find 'getWarehouses'
Verificar que `inventoryApi.ts` exporta `getWarehouses`:
```typescript
export const getWarehouses = () => {
  return api.get('/inventory/warehouses');
};
```

## 📦 Dependencias Necesarias
```json
{
  "dayjs": "^1.11.10",
  "antd": "^5.x",
  "react-router-dom": "^6.x"
}
```

## 🎯 Próximos Pasos

### Pendientes de Implementar
1. **Modal Aprobar Compra**
   - Confirmar aprobación
   - Actualizar estado a SENT

2. **Modal Recibir Mercancía**
   - Tabla de items pendientes de recibir
   - Campos por item: cantidad recibida, lote, fecha producción, fecha caducidad
   - Validación: cantidad recibida ≤ cantidad ordenada
   - Integración con inventario (crear lotes automáticamente)

3. **Detalle de Compra**
   - Ver información completa de una orden
   - Historial de recepciones
   - Imprimir/PDF

4. **Edición de Proveedores**
   - Modal/página para editar
   - Toggle activo/inactivo

5. **Reportes**
   - Compras por período
   - Compras por proveedor
   - Análisis de costos

## ✅ Verificación

### Backend Running
```bash
curl http://localhost:3000/api/purchases/suppliers | jq
```

### Frontend Running
- Abrir http://localhost:5173
- Login exitoso
- Ver menú "Compras" en sidebar
- Navegar a proveedores y compras

¡Todo listo para comenzar a usar el módulo de compras! 🎉
