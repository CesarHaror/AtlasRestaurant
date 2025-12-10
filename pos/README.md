# Sistema POS - AtlasERP

Interfaz moderna de Punto de Venta para gestionar ventas, productos y sesiones de caja.

## 🚀 Características

- ✅ **Gestión de Productos**: Visualización en grid con búsqueda y filtros
- ✅ **Carrito Inteligente**: Agregar/remover items, ajustar cantidades, calcular totales
- ✅ **Múltiples Métodos de Pago**: Efectivo, Tarjeta, Cheque, Transferencia
- ✅ **Sesiones de Caja**: Abrir/cerrar sesiones y gestionar cajas
- ✅ **Cálculos Automáticos**: Subtotal, descuentos, IVA (16%), cambio
- ✅ **Diseño Responsivo**: Desktop y Mobile optimizados
- ✅ **Interfaz Intuitiva**: Construida con Ant Design

## 🛠 Stack Tecnológico

- **React 19**: UI moderna con hooks
- **TypeScript**: Tipado estático
- **Vite**: Build tool ultrarrápido
- **Ant Design**: Componentes UI profesionales
- **Zustand**: Gestión de estado ligera
- **Axios**: Cliente HTTP

## 📁 Estructura

```
src/
├── components/        # Componentes reutilizables
├── pages/            # Páginas principales
├── services/         # Cliente API
├── stores/           # Estado global (Zustand)
├── types/            # Interfaces TypeScript
└── App.tsx           # Componente raíz
```

## 🎯 Inicio Rápido

```bash
# Desarrollo
npm run dev        # http://localhost:5173

# Build producción
npm run build

# Preview del build
npm run preview
```

## 📖 Uso

1. **Abrir Sesión**: Inicia sesión de caja
2. **Agregar Productos**: Selecciona productos del catálogo
3. **Modificar Carrito**: Ajusta cantidades o elimina items
4. **Aplicar Descuentos**: Ingresa monto de descuento
5. **Procesar Pago**: Selecciona método(s) de pago y confirma
6. **Cerrar Sesión**: Finaliza la sesión de caja

## 🔌 API Endpoints

- `GET /api/products` - Listar productos
- `GET /api/cash-registers` - Obtener cajas
- `POST /api/cash-register-sessions/open` - Abrir sesión
- `POST /api/cash-register-sessions/{id}/close` - Cerrar sesión
- `POST /api/sales` - Crear venta

## 📝 Documentación

Ver [POS_GUIDE.md](./POS_GUIDE.md) para más detalles
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
