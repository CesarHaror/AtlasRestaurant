# 📋 RESPUESTA: Tipo de Movimientos y Lógica de Transferencias

## Análisis de los Tipos de Movimientos

Tienes una comprensión excelente de los tipos de movimientos. Aquí está la confirmación:

```
✅ Compra:         ENTRADA de productos (stock sube)
✅ Venta:          SALIDA de productos (stock baja)
✅ Transferencia:  SALIDA de un almacén + ENTRADA a otro almacén (mismo ejercicio)
✅ Ajuste:         ENTRADA o SALIDA de productos (correcciones)
✅ Desperdicio:    SALIDA de productos (pérdida)
✅ Stock Inicial:  ENTRADA de productos (al crear lote)
```

---

## 🔄 RESPUESTA A TU PREGUNTA: TRANSFERENCIA EN UN SOLO EJERCICIO

**SI, absolutamente.** La transferencia debe hacerse en el mismo ejercicio como una **transacción atómica**. 

### Flujo Correcto de Transferencia:

```
┌─────────────────────────────────────────────────────────────┐
│ TRANSFERENCIA DE ALMACÉN A A ALMACÉN B (MISMO EJERCICIO)    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 1. Usuario selecciona TRANSFER en "Registrar Movimiento"    │
│                                                               │
│ 2. Sistema debe mostrar:                                     │
│    - Almacén Origen (salida)                                │
│    - Almacén Destino (entrada)                              │
│    - Producto a transferir                                  │
│    - Cantidad a transferir                                  │
│                                                               │
│ 3. Sistema registra ATÓMICAMENTE:                           │
│    ├─ Movimiento SALIDA en almacén origen (-cantidad)      │
│    └─ Movimiento ENTRADA en almacén destino (+cantidad)    │
│                                                               │
│ 4. Resultado:                                                │
│    ✅ Stock almacén A: disminuye en X                       │
│    ✅ Stock almacén B: aumenta en X                         │
│    ✅ Total empresa: no cambia (cero neto)                 │
│    ✅ Historial completo en movimientos                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ IMPLEMENTACIÓN RECOMENDADA

### Opción 1: MEJOR (Implementar para producción)

Crear un **DTO especializado para transferencias** con ambos almacenes:

```typescript
// backend/src/modules/inventory/dto/create-transfer.dto.ts
export class CreateTransferDto {
  @ApiProperty({ description: 'ID del almacén origen' })
  @IsNumber()
  @IsNotEmpty()
  sourceWarehouseId: number;

  @ApiProperty({ description: 'ID del almacén destino' })
  @IsNumber()
  @IsNotEmpty()
  destinationWarehouseId: number;

  @ApiProperty({ description: 'ID del producto' })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ description: 'ID del lote (opcional)' })
  @IsUUID()
  @IsOptional()
  lotId?: string;

  @ApiProperty({ description: 'Cantidad a transferir' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiPropertyOptional({ description: 'Motivo de transferencia' })
  @IsString()
  @IsOptional()
  reason?: string;
}
```

### Crear endpoint especializado en backend:

```typescript
// backend/src/modules/inventory/inventory.controller.ts
@Post('transfers')
@Roles('Admin', 'Gerente', 'Almacenista')
@ApiOperation({ summary: 'Transferir productos entre almacenes' })
@ApiResponse({ status: 201, description: 'Transferencia completada' })
transferBetweenWarehouses(
  @Body() createTransferDto: CreateTransferDto,
  @CurrentUser() user: any,
) {
  return this.inventoryService.transferBetweenWarehouses(
    createTransferDto,
    user.id
  );
}
```

### Implementar lógica en el servicio:

```typescript
// backend/src/modules/inventory/services/inventory.service.ts
async transferBetweenWarehouses(
  createTransferDto: CreateTransferDto,
  userId: number,
): Promise<{ sourceMovement: InventoryMovement; destMovement: InventoryMovement }> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const {
      sourceWarehouseId,
      destinationWarehouseId,
      productId,
      lotId,
      quantity,
      reason,
    } = createTransferDto;

    // Validación: origen != destino
    if (sourceWarehouseId === destinationWarehouseId) {
      throw new BadRequestException('El almacén origen y destino deben ser diferentes');
    }

    // Validación: stock disponible en origen
    const sourceLot = await queryRunner.manager.findOne(InventoryLot, {
      where: {
        id: lotId,
        productId,
        warehouseId: sourceWarehouseId,
      },
    });

    if (!sourceLot || sourceLot.currentQuantity < quantity) {
      throw new BadRequestException('Stock insuficiente en el almacén origen');
    }

    // 1. Crear movimiento de SALIDA en almacén origen
    const sourceMovement = queryRunner.manager.create(InventoryMovement, {
      movementType: MovementType.TRANSFER,
      referenceType: 'TRANSFER',
      referenceId: `${sourceWarehouseId}-${destinationWarehouseId}`,
      productId,
      lotId,
      warehouseId: sourceWarehouseId,
      quantity: -quantity, // Negativo = SALIDA
      unitCost: sourceLot.unitCost,
      totalCost: Number((sourceLot.unitCost * quantity).toFixed(4)),
      userId,
      movementDate: new Date(),
      notes: `Transferencia a almacén ${destinationWarehouseId}. ${reason || ''}`,
    });

    await queryRunner.manager.save(sourceMovement);

    // Actualizar cantidad disponible en lote origen
    sourceLot.currentQuantity -= quantity;
    await queryRunner.manager.save(sourceLot);

    // 2. Crear movimiento de ENTRADA en almacén destino
    // Si no existe lote en destino, crear uno
    let destLot = await queryRunner.manager.findOne(InventoryLot, {
      where: {
        productId,
        warehouseId: destinationWarehouseId,
        lotNumber: sourceLot.lotNumber, // Mismo lote
      },
    });

    if (!destLot) {
      destLot = queryRunner.manager.create(InventoryLot, {
        productId,
        warehouseId: destinationWarehouseId,
        lotNumber: sourceLot.lotNumber,
        internalLot: `${sourceLot.internalLot}-transferred`,
        initialQuantity: quantity,
        currentQuantity: quantity,
        reservedQuantity: 0,
        unitCost: sourceLot.unitCost,
        productionDate: sourceLot.productionDate,
        expiryDate: sourceLot.expiryDate,
        status: 'AVAILABLE',
        notes: `Transferencia desde almacén ${sourceWarehouseId}`,
      });
      destLot = await queryRunner.manager.save(destLot);
    } else {
      destLot.currentQuantity += quantity;
      await queryRunner.manager.save(destLot);
    }

    // 3. Crear movimiento de ENTRADA en almacén destino
    const destMovement = queryRunner.manager.create(InventoryMovement, {
      movementType: MovementType.TRANSFER,
      referenceType: 'TRANSFER',
      referenceId: `${sourceWarehouseId}-${destinationWarehouseId}`,
      productId,
      lotId: destLot.id,
      warehouseId: destinationWarehouseId,
      quantity: +quantity, // Positivo = ENTRADA
      unitCost: sourceLot.unitCost,
      totalCost: Number((sourceLot.unitCost * quantity).toFixed(4)),
      userId,
      movementDate: new Date(),
      notes: `Transferencia desde almacén ${sourceWarehouseId}. ${reason || ''}`,
    });

    await queryRunner.manager.save(destMovement);

    // Commit de la transacción
    await queryRunner.commitTransaction();

    return { sourceMovement, destMovement };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

### Actualizar el formulario en frontend:

```typescript
// frontend/src/pages/Inventory/TransferForm.tsx (NUEVO)
const TransferForm: React.FC = () => {
  const [form] = Form.useForm();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sourceLots, setSourceLots] = useState<InventoryLot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWarehouses();
    loadProducts();
  }, []);

  const handleSourceWarehouseChange = async (warehouseId: number) => {
    const productId = form.getFieldValue('productId');
    if (productId && warehouseId) {
      const lots = await getInventoryLotsByWarehouse(warehouseId);
      setSourceLots(lots.filter(l => l.productId === productId && l.status === 'AVAILABLE'));
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await transferApi.create({
        sourceWarehouseId: values.sourceWarehouseId,
        destinationWarehouseId: values.destinationWarehouseId,
        productId: values.productId,
        lotId: values.lotId,
        quantity: values.quantity,
        reason: values.reason,
      });
      message.success('Transferencia completada exitosamente');
      form.resetFields();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error en la transferencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="sourceWarehouseId"
        label="Almacén Origen"
        rules={[{ required: true }]}
      >
        <Select
          placeholder="Selecciona almacén origen"
          onChange={handleSourceWarehouseChange}
        >
          {warehouses.map(w => (
            <Select.Option key={w.id} value={w.id}>
              {w.name} ({w.code})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="destinationWarehouseId"
        label="Almacén Destino"
        rules={[{ required: true }]}
      >
        <Select placeholder="Selecciona almacén destino">
          {warehouses.map(w => (
            <Select.Option key={w.id} value={w.id}>
              {w.name} ({w.code})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="productId"
        label="Producto"
        rules={[{ required: true }]}
      >
        <Select placeholder="Selecciona producto">
          {products.map(p => (
            <Select.Option key={p.id} value={p.id}>
              {p.name} ({p.sku})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="lotId"
        label="Lote"
        rules={[{ required: true }]}
      >
        <Select placeholder="Selecciona lote">
          {sourceLots.map(lot => (
            <Select.Option key={lot.id} value={lot.id}>
              {lot.lotNumber} - {lot.currentQuantity} disponible
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="quantity"
        label="Cantidad"
        rules={[{ required: true, message: 'Ingresa la cantidad' }]}
      >
        <InputNumber min={0.01} placeholder="Cantidad a transferir" />
      </Form.Item>

      <Form.Item
        name="reason"
        label="Motivo (Opcional)"
      >
        <Input.TextArea rows={3} placeholder="Motivo de la transferencia" />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={loading}>
        Registrar Transferencia
      </Button>
    </Form>
  );
};
```

---

## 📊 COMPARACIÓN: TRANSFERENCIA ACTUAL vs RECOMENDADA

### ❌ ACTUAL (Problemas):
```
1. Usuario debe crear DOS movimientos manuales (uno SALIDA, uno ENTRADA)
2. Riesgo de inconsistencia: ¿qué pasa si solo crea uno?
3. No está claro que están relacionados
4. Validación manual de stock
5. Sin transacción atómica
```

### ✅ RECOMENDADA (Beneficios):
```
1. Una sola operación (transacción ACID)
2. Ambos movimientos se crean o ninguno (consistencia garantizada)
3. Relacionados automáticamente con mismo referenceId
4. Sistema valida stock automáticamente
5. Imposible estado inconsistente
6. Historial claro y auditable
```

---

## 🎯 RESUMEN: RESPUESTA A TU PREGUNTA

**¿Se debe hacer en un solo ejercicio? SÍ. EXACTAMENTE.**

- ✅ La transferencia es UNA SOLA OPERACIÓN LÓGICA
- ✅ Debe registrarse como UNA TRANSACCIÓN ATÓMICA
- ✅ Genera DOS MOVIMIENTOS internamente (salida + entrada)
- ✅ Ambos suceden "al mismo tiempo"
- ✅ El referenceId vincula ambos movimientos
- ✅ El stock no se pierde ni duplica en el camino

**Recomendación:** Implementa un endpoint `/inventory/transfers` especializado en lugar de usar el genérico de movimientos.

---

## 📝 NOTAS IMPORTANTES

1. **Transacción Atómica:** Si falla la entrada, se revierte la salida
2. **Auditoría:** Ambos movimientos tienen el mismo referenceId para rastrear
3. **Stock Origen:** Se valida ANTES de la transferencia
4. **Lote Destino:** Se crea automáticamente si no existe
5. **Consistencia:** Stock total empresa NO cambia (entrada = salida)

¿Necesitas que implemente esto ahora?
