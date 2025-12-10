import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  message,
  Typography,
  Modal,
  Form,
  InputNumber,
  Select,
  DatePicker,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { lotsApi, warehousesApi } from '../../api/inventory.api';
import { productsApi } from '../../api/products.api';
import type { InventoryLot, LotStatus } from '../../types/inventory.types';
import type { Product } from '../../types/product.types';
import { useDebounce } from '../../hooks/useDebounce';

const { Title } = Typography;

const lotStatusColors: Record<LotStatus, string> = {
  AVAILABLE: 'success',
  RESERVED: 'processing',
  EXPIRED: 'error',
  DAMAGED: 'warning',
  SOLD_OUT: 'default',
};

export default function LotsList() {
  const [lots, setLots] = useState<InventoryLot[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Array<{ id: number; name: string; code: string }>>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>();
  const [formVisible, setFormVisible] = useState(false);
  const [form] = Form.useForm();

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    loadProducts();
    loadWarehouses();
  }, []);

  useEffect(() => {
    loadLots();
  }, [debouncedSearch, selectedProductId]);

  async function loadProducts() {
    try {
      const response = await productsApi.getProducts({ limit: 500, isActive: true });
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  async function loadWarehouses() {
    try {
      setWarehousesLoading(true);
      const response = await warehousesApi.getAll();
      // Filtrar solo activos y mapear fields mínimos
      const active = response.data.filter((w) => w.isActive).map(w => ({ id: w.id, name: w.name, code: w.code }));
      setWarehouses(active);
    } catch (error) {
      console.error('Error loading warehouses:', error);
      message.error('Error al cargar almacenes');
    } finally {
      setWarehousesLoading(false);
    }
  }

  async function loadLots() {
    try {
      setLoading(true);
      let data: InventoryLot[] = [];
      if (selectedProductId) {
        const response = await lotsApi.getByProduct(selectedProductId);
        data = response.data;
      } else {
        const response = await lotsApi.getAll();
        data = response.data;
      }

      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        data = data.filter(
          (lot) =>
            lot.lotNumber.toLowerCase().includes(searchLower) ||
            lot.product?.name.toLowerCase().includes(searchLower) ||
            lot.product?.sku.toLowerCase().includes(searchLower)
        );
      }

      setLots(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al cargar lotes');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLot(values: any) {
    try {
      await lotsApi.create({
        productId: values.productId,
        warehouseId: values.warehouseId,
        lotNumber: values.lotNumber,
        initialQuantity: values.initialQuantity,
        unitCost: values.unitCost,
        productionDate: values.productionDate?.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
        notes: values.notes,
      });
      message.success('Lote creado exitosamente');
      setFormVisible(false);
      form.resetFields();
      // Si no hay producto seleccionado, seleccionar el del lote creado para que aparezca
      if (selectedProductId !== values.productId) {
        setSelectedProductId(values.productId);
        // loadLots se disparará por useEffect
      } else {
        // Ya está seleccionado, recargar
        loadLots();
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al crear lote');
    }
  }

  const columns: ColumnsType<InventoryLot> = [
    {
      title: 'Lote',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: 120,
    },
    {
      title: 'Producto',
      key: 'product',
      width: 200,
      render: (_, record) => {
        return (
          <div>
            <div className="font-semibold">{record.product?.name}</div>
            <div className="text-xs text-gray-500">{record.product?.sku}</div>
          </div>
        );
      },
    },
    {
      title: 'Disponible',
      dataIndex: 'currentQuantity',
      key: 'currentQuantity',
      width: 110,
      align: 'right',
      render: (val) => (val !== undefined ? Number(val).toLocaleString('es-MX') : '0'),
    },
    {
      title: 'Reservado',
      dataIndex: 'reservedQuantity',
      key: 'reservedQuantity',
      width: 110,
      align: 'right',
      render: (val) => (val ? Number(val).toLocaleString('es-MX') : '0'),
    },
    {
      title: 'Costo Unitario',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 120,
      align: 'right',
      render: (val) => (val !== undefined ? `$${Number(val).toFixed(2)}` : '$0.00'),
    },
    {
      title: 'Costo Total',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 130,
      align: 'right',
      render: (_, record) => {
        const total = record.totalCost ?? (record.unitCost && record.initialQuantity ? record.unitCost * record.initialQuantity : 0);
        return `$${Number(total).toFixed(2)}`;
      },
    },
    {
      title: 'Entrada',
      dataIndex: 'entryDate',
      key: 'entryDate',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Vencimiento',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: LotStatus) => (
        <Tag color={lotStatusColors[status]}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => message.info(`Lote: ${record.lotNumber}`)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Gestión de Lotes
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormVisible(true)}>
          Nuevo Lote
        </Button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Input
          placeholder="Buscar por lote, producto o SKU..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 300 }}
        />
        <Select
          placeholder="Filtrar por producto"
          value={selectedProductId}
          onChange={setSelectedProductId}
          allowClear
          style={{ width: 250 }}
        >
          {products.map((prod) => (
            <Select.Option key={prod.id} value={prod.id}>
              {prod.name} ({prod.sku})
            </Select.Option>
          ))}
        </Select>
        <Button icon={<ReloadOutlined />} onClick={loadLots}>
          Actualizar
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={lots}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 50,
          showTotal: (total) => `Total: ${total} lotes`,
        }}
      />

      <Modal
        title="Crear Nuevo Lote"
        open={formVisible}
        onCancel={() => {
          setFormVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateLot}
        >
          <Form.Item
            label="Producto"
            name="productId"
            rules={[{ required: true, message: 'Selecciona un producto' }]}
          >
            <Select placeholder="Selecciona producto">
              {products.map((prod) => (
                <Select.Option key={prod.id} value={prod.id}>
                  {prod.name} ({prod.sku})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Almacén"
            name="warehouseId"
            rules={[{ required: true, message: 'Selecciona un almacén' }]}
          >
            <Select placeholder="Selecciona almacén" loading={warehousesLoading} showSearch optionFilterProp="children">
              {warehouses.map((w) => (
                <Select.Option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Número de Lote"
            name="lotNumber"
            rules={[{ required: true, message: 'Ingresa el número de lote' }]}
          >
            <Input placeholder="Ej: LOT-2025-001" />
          </Form.Item>

          <Form.Item
            label="Cantidad Inicial"
            name="initialQuantity"
            rules={[{ required: true, message: 'Ingresa la cantidad inicial' }]}
          >
            <InputNumber min={0.001} step={0.001} placeholder="0.000" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Costo Unitario"
            name="unitCost"
            rules={[{ required: true, message: 'Ingresa el costo unitario' }]}
          >
            <InputNumber min={0} step={0.01} placeholder="0.00" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Fecha de Producción (Opcional)"
            name="productionDate"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Fecha de Vencimiento (Opcional)"
            name="expiryDate"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Notas (Opcional)"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="Notas del lote" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button onClick={() => setFormVisible(false)} style={{ marginRight: 8 }}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              Crear Lote
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
