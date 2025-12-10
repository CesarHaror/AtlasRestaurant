import { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Input, InputNumber, Button, message, Space } from 'antd';
import { getWarehouses, getInventoryLotsByWarehouse, createWasteRecord } from '../../services/inventoryApi';
import type { Warehouse, InventoryLot, CreateWasteDto } from '../../types/inventory';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface WasteFormProps {
  onSuccess: () => void;
}

export default function WasteForm({ onSuccess }: WasteFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [lots, setLots] = useState<InventoryLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<InventoryLot | null>(null);

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      const data = await getWarehouses();
      setWarehouses(data.filter(w => w.isActive));
    } catch (error) {
      message.error('Error al cargar almacenes');
    }
  };

  const loadLots = async (warehouseId: string) => {
    try {
      const data = await getInventoryLotsByWarehouse(warehouseId);
      setLots(data.filter((lot: InventoryLot) => lot.status === 'AVAILABLE' && lot.currentQuantity > 0));
    } catch (error) {
      message.error('Error al cargar lotes');
    }
  };

  const handleWarehouseChange = (warehouseId: string) => {
    form.setFieldsValue({ lotId: undefined });
    setSelectedLot(null);
    loadLots(warehouseId);
  };

  const handleLotChange = (lotId: string) => {
    const lot = lots.find(l => l.id === lotId);
    setSelectedLot(lot || null);
    if (lot) {
      form.setFieldsValue({
        quantity: lot.currentQuantity,
      });
    }
  };

  const handleSubmit = async (values: any) => {
    if (!selectedLot) {
      message.error('Seleccione un lote');
      return;
    }

    if (values.quantity > selectedLot.currentQuantity) {
      message.error('La cantidad no puede exceder el stock disponible');
      return;
    }

    setLoading(true);
    try {
      const wasteData: CreateWasteDto = {
        lotId: values.lotId,
        wasteDate: values.wasteDate.toISOString(),
        quantity: values.quantity,
        type: values.type,
        reason: values.reason,
      };

      await createWasteRecord(wasteData);
      message.success('Desperdicio registrado exitosamente');
      form.resetFields();
      setSelectedLot(null);
      onSuccess();
    } catch (error) {
      message.error('Error al registrar desperdicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        wasteDate: dayjs(),
        type: 'EXPIRY',
      }}
    >
      <Form.Item
        name="warehouseId"
        label="Almacén"
        rules={[{ required: true, message: 'Seleccione un almacén' }]}
      >
        <Select
          placeholder="Seleccione un almacén"
          onChange={handleWarehouseChange}
        >
          {warehouses.map(w => (
            <Option key={w.id} value={w.id}>
              {w.name} ({w.code})
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="lotId"
        label="Lote"
        rules={[{ required: true, message: 'Seleccione un lote' }]}
      >
        <Select
          placeholder="Seleccione un lote"
          onChange={handleLotChange}
          disabled={!form.getFieldValue('warehouseId')}
          showSearch
          filterOption={(input: string, option: any) =>
            String(option?.children).toLowerCase().includes(input.toLowerCase())
          }
        >
          {lots.map(lot => (
            <Option key={lot.id} value={lot.id}>
              {lot.lotNumber} - {lot.product.name} (Stock: {lot.currentQuantity} {lot.product.unit})
            </Option>
          ))}
        </Select>
      </Form.Item>

      {selectedLot && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
          <p><strong>Producto:</strong> {selectedLot.product.name}</p>
          <p><strong>Stock Disponible:</strong> {selectedLot.currentQuantity} {selectedLot.product.unit}</p>
          <p><strong>Costo Unitario:</strong> ${selectedLot.unitCost.toFixed(2)}</p>
        </div>
      )}

      <Form.Item
        name="wasteDate"
        label="Fecha"
        rules={[{ required: true, message: 'Seleccione una fecha' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="quantity"
        label="Cantidad"
        rules={[
          { required: true, message: 'Ingrese la cantidad' },
          { type: 'number', min: 0.01, message: 'La cantidad debe ser mayor a 0' },
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          max={selectedLot?.currentQuantity}
          step={0.01}
          placeholder="Cantidad a registrar como desperdicio"
        />
      </Form.Item>

      <Form.Item
        name="type"
        label="Tipo de Desperdicio"
        rules={[{ required: true, message: 'Seleccione un tipo' }]}
      >
        <Select>
          <Option value="EXPIRY">Vencimiento</Option>
          <Option value="DAMAGE">Daño</Option>
          <Option value="THEFT">Robo</Option>
          <Option value="TEMPERATURE">Problema de Temperatura</Option>
          <Option value="QUALITY">Problema de Calidad</Option>
          <Option value="OTHER">Otro</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="reason"
        label="Motivo/Descripción"
        rules={[{ required: true, message: 'Ingrese el motivo' }]}
      >
        <TextArea rows={3} placeholder="Describa el motivo del desperdicio..." />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Registrar Desperdicio
          </Button>
          <Button onClick={() => form.resetFields()}>
            Limpiar
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
