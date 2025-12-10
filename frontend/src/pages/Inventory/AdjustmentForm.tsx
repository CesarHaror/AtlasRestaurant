import { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Input, Button, Table, InputNumber, message, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { getWarehouses, getInventoryLotsByWarehouse, createAdjustment } from '../../services/inventoryApi';
import type { Warehouse, InventoryLot, CreateAdjustmentDto } from '../../types/inventory';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface AdjustmentFormProps {
  onSuccess: () => void;
}

interface AdjustmentItemRow {
  key: string;
  lotId: string;
  lotNumber: string;
  productName: string;
  systemQuantity: number;
  physicalQuantity: number;
  difference: number;
}

export default function AdjustmentForm({ onSuccess }: AdjustmentFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [lots, setLots] = useState<InventoryLot[]>([]);
  const [items, setItems] = useState<AdjustmentItemRow[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>();

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
      setLots(data.filter((lot: InventoryLot) => lot.status === 'AVAILABLE'));
    } catch (error) {
      message.error('Error al cargar lotes');
    }
  };

  const handleWarehouseChange = (warehouseId: string) => {
    setSelectedWarehouse(warehouseId);
    setItems([]);
    loadLots(warehouseId);
  };

  const handleAddItem = (lotId: string) => {
    const lot = lots.find(l => l.id === lotId);
    if (!lot) return;

    // Verificar si ya existe
    if (items.some(item => item.lotId === lotId)) {
      message.warning('Este lote ya está en la lista');
      return;
    }

    const newItem: AdjustmentItemRow = {
      key: lotId,
      lotId: lot.id,
      lotNumber: lot.lotNumber,
      productName: lot.product.name,
      systemQuantity: lot.currentQuantity,
      physicalQuantity: lot.currentQuantity,
      difference: 0,
    };

    setItems([...items, newItem]);
  };

  const handleQuantityChange = (key: string, value: number) => {
    setItems(items.map(item => {
      if (item.key === key) {
        return {
          ...item,
          physicalQuantity: value,
          difference: value - item.systemQuantity,
        };
      }
      return item;
    }));
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      message.warning('Debe agregar al menos un item');
      return;
    }

    setLoading(true);
    try {
      const adjustmentData: CreateAdjustmentDto = {
        warehouseId: values.warehouseId,
        adjustmentDate: values.adjustmentDate.toISOString(),
        type: values.type,
        reason: values.reason,
        items: items.map(item => ({
          lotId: item.lotId,
          systemQuantity: item.systemQuantity,
          physicalQuantity: item.physicalQuantity,
        })),
      };

      await createAdjustment(adjustmentData);
      message.success('Ajuste creado exitosamente');
      form.resetFields();
      setItems([]);
      onSuccess();
    } catch (error) {
      message.error('Error al crear ajuste');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Lote',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
    },
    {
      title: 'Producto',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Cantidad Sistema',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
      align: 'right' as const,
      render: (qty: number) => qty.toFixed(2),
    },
    {
      title: 'Cantidad Física',
      dataIndex: 'physicalQuantity',
      key: 'physicalQuantity',
      render: (_: any, record: AdjustmentItemRow) => (
        <InputNumber
          min={0}
          value={record.physicalQuantity}
          onChange={(value: number | null) => handleQuantityChange(record.key, value || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Diferencia',
      dataIndex: 'difference',
      key: 'difference',
      align: 'right' as const,
      render: (diff: number) => (
        <span style={{ color: diff >= 0 ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
          {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: AdjustmentItemRow) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        adjustmentDate: dayjs(),
        type: 'PHYSICAL_COUNT',
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
        name="adjustmentDate"
        label="Fecha de Ajuste"
        rules={[{ required: true, message: 'Seleccione una fecha' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="type"
        label="Tipo"
        rules={[{ required: true, message: 'Seleccione un tipo' }]}
      >
        <Select>
          <Option value="PHYSICAL_COUNT">Conteo Físico</Option>
          <Option value="SYSTEM_ERROR">Error del Sistema</Option>
          <Option value="DAMAGE">Daño</Option>
          <Option value="THEFT">Robo</Option>
          <Option value="OTHER">Otro</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="reason"
        label="Motivo"
        rules={[{ required: true, message: 'Ingrese el motivo' }]}
      >
        <TextArea rows={3} placeholder="Describa el motivo del ajuste..." />
      </Form.Item>

      {selectedWarehouse && (
        <>
          <Form.Item label="Agregar Lote">
            <Select
              placeholder="Seleccione un lote para agregar"
              onChange={handleAddItem}
              value={undefined}
              showSearch
              filterOption={(input: string, option: any) =>
                String(option?.children).toLowerCase().includes(input.toLowerCase())
              }
            >
              {lots.map(lot => (
                <Option key={lot.id} value={lot.id}>
                  {lot.lotNumber} - {lot.product.name} ({lot.currentQuantity} {lot.product.unit})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Table
            columns={columns}
            dataSource={items}
            pagination={false}
            size="small"
            locale={{ emptyText: 'No hay items agregados' }}
          />
        </>
      )}

      <Form.Item style={{ marginTop: 24 }}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Crear Ajuste
          </Button>
          <Button onClick={() => form.resetFields()}>
            Limpiar
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
