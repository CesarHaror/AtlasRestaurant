# 🚀 GUÍA RÁPIDA DE USO - POS MULTI-SESIÓN

## ¿Qué es Nuevo?

Ahora el POS de AtlasERP soporta **múltiples tickets abiertos simultáneamente**, ideal para carnicerías que atienden tanto mostrador de carnes como servicio de asador.

---

## 🎯 Tareas Principales

### 1. **Crear un Nuevo Ticket**

**Dónde:** En la barra de tickets (debajo del header)
```
[Ticket #abc] [Ticket #def] [+]  ← Click aquí
                              📦5  (números son artículos)
```

**Qué hace:**
- Crea un nuevo ticket automáticamente
- Te traslada a ese ticket
- Los otros tickets permanecen guardados

**Shortcut:** Click en el botón **+** verde en SessionTabs

---

### 2. **Cambiar Entre Tickets**

**Dónde:** Click en cualquier ticket en la barra

```
[Ticket #abc] ← No activo (gris)
[Ticket #def] ← Activo (azul) 
  📦3
```

**Qué sucede:**
- Tu carrito actual se guarda automáticamente
- Ves el carrito del ticket que seleccionaste
- Puedes continuar agregando productos

**Tip:** El ticket azul es el activo. Los números indican cantidad de artículos.

---

### 3. **Renombrar Tickets**

**Dónde:** Click en el icono ✏️ (lápiz) en el ticket activo

```
[Mesa 5] ← Renombrado
   📦8
   ✏️ ← Click aquí
```

**Opciones comunes:**
- `Mesa 1`, `Mesa 2`, etc. (para asador)
- `Mostrador Carnes`, `Mostrador A`, etc. (para carnes)
- `Para llevar`, `Delivery`, etc. (para pedidos)

**Ventaja:** Te resulta mucho más fácil identificar qué es cada ticket.

---

### 4. **Ver Resumen de un Ticket**

**Dónde:** Click en **Resumen** en la barra de info del ticket

```
[Caja] [ID: abc123...] [Resumen] ← Click aquí
```

**Qué ves:**
- 📦 Total de artículos en ese ticket
- 💳 Número de pagos que ya hizo
- Subtotal, Impuesto, Total
- Historial de todos los pagos de ese ticket

**Ejemplo:**
```
┌──────────────────────────────┐
│ Artículos: 5    Transacciones: 1 │
├──────────────────────────────┤
│ Subtotal:  $100.00           │
│ Impuesto:   $21.00           │
│ Total:     $121.00           │
├──────────────────────────────┤
│ Transacción #1: $121.00      │
│ Efectivo + Tarjeta           │
└──────────────────────────────┘
```

---

### 5. **Pagar un Ticket**

**Dónde:** Botón **PAGAR** en el carrito (abajo a la derecha)

**Flujo:**
1. Selecciona el ticket que quieres pagar
2. Verifica que el carrito tenga los artículos correctos
3. Click **PAGAR**
4. Ingresa método de pago y monto
5. Confirma
6. ✅ Ese ticket se marca como pagado y su carrito se limpia
7. Otros tickets siguen intactos

**Importante:** Solo se limpia el carrito del ticket que pagaste.

---

### 6. **Cerrar un Ticket**

**Dónde:** Icono **X** (cruz) en el ticket activo

```
[Mesa 5] ← Activo
   📦0
   ✏️ X ← Click aquí para cerrar
```

**Qué sucede:**
- Se cierra ese ticket
- Se archiva automáticamente en el historial
- Si tiene otros tickets, se abre el siguiente
- Si es el último, vuelves a estar sin tickets activos

**Nota:** Solo puedes cerrar el ticket que está activo (el azul).

---

### 7. **Ver Historial de Sesiones Completadas**

**Dónde:** Botón **Historial** en el header (solo aparece si hay sesión abierta)

```
[Caja] [Gestionar Sesiones] [Historial] ← Click aquí
```

**Qué ves:**
- Tabla de todos los tickets que cerraste hoy
- ID de cada ticket
- Nombre si lo renombraste
- Cantidad de artículos
- Total de dinero de cada uno
- Monto total del día

**Ejemplo:**
```
ID        Nombre           Artículos  Dinero    Hora
abc123    Mesa 1              5      $150.00   14:32
def456    Mostrador Carnes    3      $200.00   14:45
ghi789    Para llevar         2      $85.00    14:58
─────────────────────────────────────────────────
TOTAL:    3 sesiones         10     $435.00
```

---

## 📊 Flujo Completo de Operación

```
INICIO DEL DÍA
│
├─ Abrir Sesión de Caja ("Abrir Sesión" button)
│
├─ CLIENTE 1 LLEGA
│  ├─ Click "+" → Crea Ticket #abc123
│  ├─ Renombra a "Mesa 1"
│  ├─ Agrega: Asado, Costillas, Chorizo
│  └─ Espera mientras se prepara
│
├─ CLIENTE 2 LLEGA (mientras Cliente 1 espera)
│  ├─ Click "+" → Crea Ticket #def456
│  ├─ Renombra a "Mostrador"
│  ├─ Agrega: Bife, Tira, Entraña
│  └─ Paga inmediatamente
│
├─ CLIENTE 1 REGRESA
│  ├─ Click en "Mesa 1" para volver a su ticket
│  ├─ Verifica su carrito (todo sigue ahí)
│  ├─ Agrega algo más si falta
│  └─ Paga
│
├─ CIERRE DE CAJA (al final del día)
│  ├─ Click "Historial"
│  ├─ Ves todos los tickets del día
│  ├─ Verifica totales
│  └─ Reportes/Cierre
│
└─ FIN
```

---

## 💡 Tips y Trucos

### ✅ Buenas Prácticas

1. **Renombra siempre los tickets**
   - Facilita seguimiento
   - Evita confusiones
   - Ejemplo: "Mesa 5", "Para llevar"

2. **Usa el botón Resumen antes de cobrar**
   - Verifica totales correctos
   - Confirma artículos antes de pagar
   - Evita errores

3. **Cambia de ticket antes de pagar**
   - Asegúrate que es el correcto
   - El azul es el activo
   - Si pagues en el ticket equivocado, se limpia ese

4. **Cierra tickets cuando termines**
   - Mantiene limpia la pantalla
   - Facilita el historial
   - Ayuda a cerrar caja

### ⚠️ Cosas a Evitar

1. ❌ No pierdas el track de qué ticket está activo
   - Mira el color: AZUL = activo, GRIS = inactivo

2. ❌ No pagues el ticket equivocado
   - Siempre verifica el nombre renombrado
   - Click en el ticket ANTES de pagar

3. ❌ No cierres un ticket sin querer
   - El botón X es solo para cerrar
   - No puedes deshacer pero está en historial

4. ❌ No esperes a tener muchos tickets sin nombrar
   - Cambia cuando tengas más de 3-4
   - Es más fácil confundirse

---

## 🔍 Troubleshooting

### P: "¿Dónde está mi carrito del otro ticket?"

**R:** Click en el nombre del ticket en la barra superior. Tu carrito se guardó automáticamente.

---

### P: "¿Cómo sé cuál ticket es cuál?"

**R:** Renómbralos. Click en ✏️ cuando esté activo. Pon "Mesa 1", "Mostrador", etc.

---

### P: "¿Qué pasa si cierro la app?"

**R:** Se pierden los tickets abiertos. El historial (los pagos) se guarda en el servidor.

---

### P: "¿Puedo pagar parte de un ticket y dejar el resto?"

**R:** No. Este sistema paga el ticket completo. Luego puedes agregar más al ticket y pagar nuevamente.

---

### P: "¿Cuántos tickets puedo tener abiertos?"

**R:** Teóricamente ilimitados. Aunque visualmente es más fácil con 2-5 tickets.

---

## 📞 Preguntas Frecuentes

**¿Cada ticket se imprime por separado?**
Sí. Cuando pagas un ticket, se imprime la factura de ese ticket.

**¿Se guardan los nombres de los tickets?**
No. Los nombres son solo para esta sesión del POS. Si cierras la app, se pierden.

**¿Puedo ver ventas de días anteriores?**
No. El historial es solo de esta sesión de caja abierta.

**¿Qué pasa si alguien abre un ticket pero no compra nada?**
Click "X" para cerrar. Se archiva como ticket de $0.00.

**¿Puedo cambiar el nombre de un ticket después de pagarlo?**
No. Una vez pagado y cerrado, es historia.

---

## 🎓 Ejemplos Prácticos

### Ejemplo 1: Mostrador de Carnes Típico

```
14:30 - Cliente llega al mostrador
├─ Crea Ticket → Renombra a "Mostrador A"
├─ Agrega: 1kg Asado, 500g Chorizo
├─ Dice: "Dame también mejillones"
├─ Agrega más
├─ Cliente paga: $250 efectivo + $50 tarjeta
├─ Carrito se limpia
├─ Listo para siguiente cliente

14:35 - Siguiente cliente
├─ Crea Ticket → Renombra a "Mostrador B"
├─ Agrega: Tira, Milanesas
├─ Etc...
```

### Ejemplo 2: Asador con Espera

```
19:00 - Grupo llega para comer
├─ Crea Ticket → Renombra a "Mesa 5"
├─ Agrega: 2x Hamburguesa, 1x Costilla, 3x Gaseosa
├─ Se van a la mesa a esperar
│
19:15 - Otro grupo llega
├─ Crea Ticket → Renombra a "Mesa 7"
├─ Agrega sus órdenes
│
19:25 - Comida de Mesa 5 está lista
├─ Click en "Mesa 5"
├─ Agrega bebidas extras si pidió
├─ Paga: $350 efectivo
│
19:40 - Mesa 7 quiere agregar más
├─ Click en "Mesa 7"
├─ Sigue ahí su carrito original
├─ Agrega más cosas
├─ Paga
```

---

## 🔐 Seguridad

- Solo tú (el usuario logueado) ves los tickets
- Los datos se guardan en el servidor backend
- Cada pago requiere confirmación
- No hay pago accidental

---

**¿Preguntas?** Contacta a Soporte o revisa la documentación en FASES_IMPLEMENTADAS.md

**Versión:** 1.0 - Multi-Sesión
**Última actualización:** 4 de Diciembre de 2024
