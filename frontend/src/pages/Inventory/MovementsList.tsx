import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  message,
  Typography,
  Modal,
  Form,
  InputNumber,
  Select,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { movementsApi, warehousesApi, transfersApi, lotsApi } from '../../api/inventory.api';
import { productsApi } from '../../api/products.api';
import type { InventoryMovement, MovementType } from '../../types/inventory.types';
import type { Product } from '../../types/product.types';
import { useDebounce } from '../../hooks/useDebounce';

const { Title } = Typography;

const movementTypeColors: Record<MovementType, string> = {
  PURCHASE: 'green',
  SALE: 'blue',
  TRANSFER: 'orange',
  ADJUSTMENT: 'purple',
  WASTE: 'red',
  INITIAL: 'cyan',
};

const movementTypeLabels: Record<MovementType, string> = {
  PURCHASE: 'Compra',
  SALE: 'Venta',
  TRANSFER: 'Transferencia',
  ADJUSTMENT: 'Ajuste',
  WASTE: 'Desperdicio',
  INITIAL: 'Stock Inicial',
};

export default function MovementsList() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Array<{ id: number; name: string; code: string; isActive: boolean }>>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [lotsLoading, setLotsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>();
  const [formVisible, setFormVisible] = useState(false);
  const [movementType, setMovementType] = useState<string>('');
  const [sortField, setSortField] = useState<string>('movementDate');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend');
  const [form] = Form.useForm();

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    loadProducts();
    loadWarehouses();
  }, []);

  useEffect(() => {
    loadMovements();
  }, [debouncedSearch, selectedProductId, sortField, sortOrder]);

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
      const active = (response.data || response || []).filter((w: any) => w.isActive);
      setWarehouses(active);
    } catch (error) {
      console.error('Error loading warehouses:', error);
      message.error('Error al cargar almacenes');
    } finally {
      setWarehousesLoading(false);
    }
  }

  async function loadLotsByWarehouse(warehouseId: number, productId: number) {
    try {
      setLotsLoading(true);
      const response = await lotsApi.getByProduct(productId, warehouseId);
      const availableLots = (response.data || []).filter((lot: any) => lot.currentQuantity > 0);
      setLots(availableLots);
    } catch (error) {
      console.error('Error loading lots:', error);
      setLots([]);
    } finally {
      setLotsLoading(false);
    }
  }

  async function loadMovements() {
    try {
      setLoading(true);
      let data: InventoryMovement[] = [];

      if (selectedProductId) {
        const response = await movementsApi.getByProduct(selectedProductId);
        data = response.data;
      } else {
        const response = await movementsApi.getAll();
        data = response.data;
      }

      // Filtrar por búsqueda si existe
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        data = data.filter(
          (mov) =>
            mov.product?.name.toLowerCase().includes(searchLower) ||
            mov.product?.sku.toLowerCase().includes(searchLower) ||
            mov.notes?.toLowerCase().includes(searchLower)
        );
      }

      // Aplicar sorting
      data = sortData(data, sortField, sortOrder);

      setMovements(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  }

  function sortData(data: InventoryMovement[], field: string, order: 'ascend' | 'descend') {
    const sorted = [...data].sort((a, b) => {
      let aValue: any = a;
      let bValue: any = b;

      // Navegar a campos anidados
      if (field.includes('.')) {
        const parts = field.split('.');
        for (const part of parts) {
          aValue = aValue?.[part];
          bValue = bValue?.[part];
        }
      } else {
        aValue = a[field as keyof InventoryMovement];
        bValue = b[field as keyof InventoryMovement];
      }

      // Comparación
      if (aValue < bValue) return order === 'ascend' ? -1 : 1;
      if (aValue > bValue) return order === 'ascend' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  async function handleCreateMovement(values: any) {
    try {
      if (values.movementType === 'TRANSFER') {
        // Crear transferencia
        await transfersApi.create({
          sourceWarehouseId: values.sourceWarehouseId,
          destinationWarehouseId: values.destinationWarehouseId,
          productId: values.productId,
          lotId: values.lotId,
          quantity: values.quantity,
          notes: values.notes,
        });
        message.success('Transferencia registrada exitosamente');
      } else {
        // Crear movimiento normal
        await movementsApi.create({
          productId: values.productId,
          warehouseId: values.warehouseId,
          lotId: values.lotId,
          quantity: values.quantity,
          movementType: values.movementType,
          referenceType: values.referenceType,
          referenceId: values.referenceId,
          notes: values.notes,
        });
        message.success('Movimiento registrado exitosamente');
      }
      setFormVisible(false);
      form.resetFields();
      setMovementType('');
      setLots([]);
      loadMovements();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al crear movimiento');
    }
  }

  const columns: ColumnsType<InventoryMovement> = [
    {
      title: 'Tipo',
      dataIndex: 'movementType',
      key: 'movementType',
      width: 120,
      sorter: true,
      sortOrder: sortField === 'movementType' ? sortOrder : undefined,
      render: (type: MovementType) => (
        <Tag color={movementTypeColors[type]}>
          {movementTypeLabels[type]}
        </Tag>
      ),
    },
    {
      title: 'Producto',
      key: 'product',
      width: 200,
      sorter: true,
      sortOrder: sortField === 'product.name' ? sortOrder : undefined,
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
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      sorter: true,
      sortOrder: sortField === 'quantity' ? sortOrder : undefined,
      render: (quantity) => quantity.toLocaleString('es-MX'),
    },
    {
      title: 'Almacén',
      key: 'warehouse',
      width: 150,
      sorter: true,
      sortOrder: sortField === 'warehouse.name' ? sortOrder : undefined,
      render: (_, record) => record.warehouse?.name || '-',
    },
    {
      title: 'Referencia',
      key: 'reference',
      width: 150,
      render: (_, record) => {
        if (record.referenceType && record.referenceId) {
          return `${record.referenceType}-${record.referenceId}`;
        }
        return '-';
      },
    },
    {
      title: 'Fecha',
      dataIndex: 'movementDate',
      key: 'movementDate',
      width: 120,
      sorter: true,
      sortOrder: sortField === 'movementDate' ? sortOrder : undefined,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Usuario',
      key: 'createdBy',
      width: 120,
      sorter: true,
      sortOrder: sortField === 'createdBy.username' ? sortOrder : undefined,
      render: (_, record) => record.createdBy?.username || '-',
    },
    {
      title: 'Notas',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes) => notes || '-',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Movimientos de Inventario
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormVisible(true)}>
          Nuevo Movimiento
        </Button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Input
          placeholder="Buscar por producto, SKU o notas..."
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
        <Button icon={<ReloadOutlined />} onClick={loadMovements}>
          Actualizar
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={movements}
        rowKey="id"
        loading={loading}
        onChange={(pagination, filters, sorter: any) => {
          if (sorter && sorter.field) {
            setSortField(sorter.field);
            setSortOrder(sorter.order || 'descend');
          }
        }}
        pagination={{
          pageSize: 50,
          showTotal: (total) => `Total: ${total} movimientos`,
        }}
      />

      <Modal
        title="Registrar Nuevo Movimiento"
        open={formVisible}
        onCancel={() => {
          setFormVisible(false);
          form.resetFields();
          setMovementType('');
          setLots([]);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateMovement}
        >
          <Form.Item
            label="Tipo de Movimiento"
            name="movementType"
            rules={[{ required: true, message: 'Selecciona tipo de movimiento' }]}
          >
            <Select 
              placeholder="Selecciona tipo"
              onChange={(value) => {
                setMovementType(value);
                form.setFieldValue('sourceWarehouseId', undefined);
                form.setFieldValue('destinationWarehouseId', undefined);
                form.setFieldValue('warehouseId', undefined);
                form.setFieldValue('lotId', undefined);
                setLots([]);
              }}
            >
              <Select.Option value="PURCHASE">Compra</Select.Option>
              <Select.Option value="SALE">Venta</Select.Option>
              <Select.Option value="TRANSFER">Transferencia</Select.Option>
              <Select.Option value="ADJUSTMENT">Ajuste</Select.Option>
              <Select.Option value="WASTE">Desperdicio</Select.Option>
              <Select.Option value="INITIAL">Stock Inicial</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Producto"
            name="productId"
            rules={[{ required: true, message: 'Selecciona un producto' }]}
          >
            <Select 
              placeholder="Selecciona producto"
              onChange={(productId) => {
                if (movementType === 'TRANSFER' && form.getFieldValue('sourceWarehouseId')) {
                  loadLotsByWarehouse(form.getFieldValue('sourceWarehouseId'), productId);
                }
              }}
            >
              {products.map((prod) => (
                <Select.Option key={prod.id} value={prod.id}>
                  {prod.name} ({prod.sku})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {movementType === 'TRANSFER' ? (
            <>
              <Form.Item
                label="Almacén Origen"
                name="sourceWarehouseId"
                rules={[{ required: true, message: 'Selecciona almacén origen' }]}
              >
                <Select
                  placeholder="Selecciona almacén origen"
                  loading={warehousesLoading}
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) => {
                    const label = String(option?.label || '');
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                  onChange={(value) => {
                    if (form.getFieldValue('productId')) {
                      loadLotsByWarehouse(value, form.getFieldValue('productId'));
                    }
                  }}
                >
                  {warehouses.map((warehouse) => (
                    <Select.Option key={warehouse.id} value={warehouse.id} label={`${warehouse.name} (${warehouse.code})`}>
                      {warehouse.name} ({warehouse.code})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Lote"
                name="lotId"
                rules={[{ required: true, message: 'Selecciona un lote' }]}
              >
                <Select
                  placeholder="Selecciona lote"
                  loading={lotsLoading}
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) => {
                    const label = String(option?.label || '');
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {lots.map((lot) => (
                    <Select.Option 
                      key={lot.id} 
                      value={lot.id}
                      label={`${lot.lotNumber} (${lot.currentQuantity} disponibles)`}
                    >
                      {lot.lotNumber} - {lot.currentQuantity} disponibles
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Almacén Destino"
                name="destinationWarehouseId"
                rules={[{ required: true, message: 'Selecciona almacén destino' }]}
              >
                <Select
                  placeholder="Selecciona almacén destino"
                  loading={warehousesLoading}
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) => {
                    const label = String(option?.label || '');
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {warehouses.filter(w => w.id !== form.getFieldValue('sourceWarehouseId')).map((warehouse) => (
                    <Select.Option key={warehouse.id} value={warehouse.id} label={`${warehouse.name} (${warehouse.code})`}>
                      {warehouse.name} ({warehouse.code})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          ) : (
            <Form.Item
              label="Almacén"
              name="warehouseId"
              rules={[{ required: true, message: 'Selecciona un almacén' }]}
            >
              <Select
                placeholder="Selecciona un almacén"
                loading={warehousesLoading}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) => {
                  const label = String(option?.label || '');
                  return label.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {warehouses.map((warehouse) => (
                  <Select.Option key={warehouse.id} value={warehouse.id} label={`${warehouse.name} (${warehouse.code})`}>
                    {warehouse.name} ({warehouse.code})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            label="Cantidad"
            name="quantity"
            rules={[{ required: true, message: 'Ingresa la cantidad' }]}
          >
            <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
          </Form.Item>

          {movementType !== 'TRANSFER' && (
            <>
              <Form.Item
                label="Referencia - Tipo (Opcional)"
                name="referenceType"
              >
                <Input placeholder="Ej: PURCHASE, SALE" />
              </Form.Item>

              <Form.Item
                label="Referencia - ID (Opcional)"
                name="referenceId"
              >
                <InputNumber placeholder="ID de la referencia" style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}

          <Form.Item
            label="Notas (Opcional)"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="Notas del movimiento" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button onClick={() => {
              setFormVisible(false);
              setMovementType('');
              setLots([]);
            }} style={{ marginRight: 8 }}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              Registrar Movimiento
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
