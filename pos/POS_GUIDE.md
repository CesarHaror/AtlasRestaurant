# Frontend POS - Guía Rápida

## Descripción
Sistema de Punto de Venta moderno construido con React, TypeScript y Ant Design.

## Características

### 1. **Gestión de Productos**
- Visualización en grid responsivo
- Información de SKU, nombre y precio
- Badge de stock disponible/agotado

### 2. **Carrito de Compras**
- Agregar/remover productos
- Modificar cantidades en tiempo real
- Cálculo automático de subtotal, descuentos e IVA (16%)
- Total dinámico

### 3. **Sesiones de Caja**
- Abrir sesión de caja antes de vender
- Mostrar sesión activa en encabezado
- Cerrar sesión al finalizar

### 4. **Procesamiento de Pagos**
- Múltiples métodos: Efectivo, Tarjeta, Cheque, Transferencia
- Validación de montos pagados
- Cálculo automático de cambio
- Modal intuitivo de pago

### 5. **Diseño Responsivo**
- Desktop: productos a la izquierda, carrito a la derecha
- Mobile: carrito en drawer deslizable

## Estructura de Archivos

```
src/
├── components/
│   ├── ProductGrid.tsx      # Grilla de productos
│   ├── ProductGrid.css
│   ├── Cart.tsx             # Carrito de compras
│   ├── Cart.css
│   └── PaymentModal.tsx     # Modal de pagos
├── pages/
│   ├── POSPage.tsx          # Página principal
│   └── POSPage.css
├── services/
│   └── api.ts               # Cliente HTTP configurado
├── stores/
│   ├── cartStore.ts         # Estado del carrito (Zustand)
│   └── sessionStore.ts      # Estado de sesión (Zustand)
├── types/
│   └── index.ts             # Interfaces TypeScript
├── App.tsx                  # Componente raíz
├── main.tsx                 # Punto de entrada
└── index.css                # Estilos globales
```

## Flujo de Uso

1. **Iniciar sesión**: Click en "Abrir Sesión"
2. **Agregar productos**: Click en "Agregar" en cada producto
3. **Revisar carrito**: Desktop muestra carrito en sidebar, mobile en drawer
4. **Aplicar descuento**: Ingresar monto en campo de descuento
5. **Procesar pago**: Click "Procesar Pago" → Seleccionar método(s) → Confirmar
6. **Cerrar sesión**: Click "Cerrar Sesión" al finalizar

## API Endpoints Requeridos

```
GET  /api/products              # Listar productos
GET  /api/cash-registers        # Obtener cajas
POST /api/cash-register-sessions/open     # Abrir sesión
POST /api/cash-register-sessions/{id}/close # Cerrar sesión
GET  /api/cash-register-sessions/active   # Obtener sesiones activas
POST /api/sales                 # Crear venta
```

## Dependencias Principales

- `react`: Framework UI
- `antd`: Componentes UI
- `zustand`: Gestión de estado
- `axios`: Cliente HTTP
- `typescript`: Tipado estático

## Instalación y Ejecución

```bash
cd pos
npm install
npm run dev      # Desarrollo: http://localhost:5173
npm run build    # Producción
```

## Notas de Desarrollo

- El estado de carrito persiste en Zustand (en memoria durante la sesión)
- Los datos se sincronizamos desde el backend
- Validaciones en cliente + servidor recomendadas
- Considerar agregar persistencia de carrito en localStorage si se desea
