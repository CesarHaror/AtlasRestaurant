import { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Space, Row, Col, message, Card, Table, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createPurchase } from '../../services/purchasesApi';
import { searchSuppliers } from '../../services/purchasesApi';
import { getWarehouses } from '../../services/inventoryApi';
import { searchProducts } from '../../services/productApi';
import dayjs from 'dayjs';

const { Option } = Select;

const PurchaseForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, taxAmount: 0, discountAmount: 0, totalAmount: 0 });

  useEffect(() => {
    loadSuppliers();
    loadWarehouses();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [items]);

  const loadSuppliers = async () => {
    try {
      const response = await searchSuppliers('', 50);
      setSuppliers(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await getWarehouses();
      setWarehouses(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchProducts = async (value) => {
    if (value.length < 2) return;
    try {
      const response = await searchProducts(value);
      setProducts(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      { key: Date.now(), productId: null, menuItem: null, quantityOrdered: 1, unitCost: 0, taxRate: 16, discountPercentage: 0 },
    ]);
  };

  const removeItem = (key) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const updateItem = (key, field, value) => {
    setItems(
      items.map((item) =>
        item.key === key
          ? {
              ...item,
              [field]: value,
              ...(field === 'productId' && value
                ? { menuItem: products.find((p) => p.id === value) }
                : {}),
            }
          : item
      )
    );
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    items.forEach((item) => {
      const qty = Number(item.quantityOrdered) || 0;
      const cost = Number(item.unitCost) || 0;
      const discountPct = Number(item.discountPercentage) || 0;
      const taxPct = Number(item.taxRate) || 0;

      const lineSubtotal = qty * cost;
      const lineDiscount = lineSubtotal * (discountPct / 100);
      const base = lineSubtotal - lineDiscount;
      const lineTax = base * (taxPct / 100);

      subtotal += base;
      taxAmount += lineTax;
      discountAmount += lineDiscount;
    });

    const totalAmount = subtotal + taxAmount;
    setTotals({ subtotal, taxAmount, discountAmount, totalAmount });
  };

  const handleSubmit = async (values) => {
    if (items.length === 0) {
      message.warning('Debe agregar al menos un producto');
      return;
    }

    setLoading(true);
    try {
      const purchaseData = {
        branchId: 1, // TODO: Obtener de contexto de usuario
        warehouseId: values.warehouseId,
        supplierId: values.supplierId,
        orderDate: values.orderDate.format('YYYY-MM-DD'),
        expectedDeliveryDate: values.expectedDeliveryDate?.format('YYYY-MM-DD'),
        supplierInvoice: values.supplierInvoice,
        paymentTerms: values.paymentTerms,
        dueDate: values.dueDate?.format('YYYY-MM-DD'),
        notes: values.notes,
        items: items.map((item) => ({
          productId: item.productId,
          quantityOrdered: Number(item.quantityOrdered),
          unitCost: Number(item.unitCost),
          taxRate: Number(item.taxRate),
          discountPercentage: Number(item.discountPercentage),
        })),
      };

      await createPurchase(purchaseData);
      message.success('Compra creada exitosamente');
      navigate('/purchases');
    } catch (error) {
      message.error('Error al crear compra');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const itemColumns = [
    {
      title: 'Producto',
      dataIndex: 'productId',
      key: 'productId',
      width: 250,
      render: (_, record) => (
        <Select
          showSearch
          placeholder="Buscar producto..."
          style={{ width: '100%' }}
          value={record.productId}
          onChange={(value) => updateItem(record.key, 'productId', value)}
          onSearch={handleSearchProducts}
          filterOption={false}
        >
          {products.map((p) => (
            <Option key={p.id} value={p.id}>
              {p.name} ({p.sku})
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantityOrdered',
      key: 'quantityOrdered',
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={0.01}
          step={1}
          value={record.quantityOrdered}
          onChange={(value) => updateItem(record.key, 'quantityOrdered', value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Costo Unitario',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 120,
      render: (_, record) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.unitCost}
          onChange={(value) => updateItem(record.key, 'unitCost', value)}
          style={{ width: '100%' }}
          formatter={(value) => `$ ${value}`}
          parser={(value) => value.replace(/\$\s?/g, '')}
        />
      ),
    },
    {
      title: 'Impuesto %',
      dataIndex: 'taxRate',
      key: 'taxRate',
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={0}
          max={100}
          step={1}
          value={record.taxRate}
          onChange={(value) => updateItem(record.key, 'taxRate', value)}
          style={{ width: '100%' }}
          formatter={(value) => `${value}%`}
          parser={(value) => value.replace('%', '')}
        />
      ),
    },
    {
      title: 'Descuento %',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={0}
          max={100}
          step={1}
          value={record.discountPercentage}
          onChange={(value) => updateItem(record.key, 'discountPercentage', value)}
          style={{ width: '100%' }}
          formatter={(value) => `${value}%`}
          parser={(value) => value.replace('%', '')}
        />
      ),
    },
    {
      title: 'Total',
      key: 'total',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const qty = Number(record.quantityOrdered) || 0;
        const cost = Number(record.unitCost) || 0;
        const discountPct = Number(record.discountPercentage) || 0;
        const taxPct = Number(record.taxRate) || 0;
        const lineSubtotal = qty * cost;
        const lineDiscount = lineSubtotal * (discountPct / 100);
        const base = lineSubtotal - lineDiscount;
        const lineTax = base * (taxPct / 100);
        const total = base + lineTax;
        return `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.key)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Nueva Orden de Compra">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Proveedor"
                name="supplierId"
                rules={[{ required: true, message: 'Seleccione un proveedor' }]}
              >
                <Select
                  showSearch
                  placeholder="Seleccionar proveedor..."
                  optionFilterProp="children"
                >
                  {suppliers.map((s) => (
                    <Option key={s.id} value={s.id}>
                      {s.tradeName || s.businessName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Almacén"
                name="warehouseId"
                rules={[{ required: true, message: 'Seleccione un almacén' }]}
              >
                <Select placeholder="Seleccionar almacén...">
                  {warehouses.map((w) => (
                    <Option key={w.id} value={w.id}>
                      {w.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Fecha de Orden"
                name="orderDate"
                initialValue={dayjs()}
                rules={[{ required: true, message: 'Ingrese la fecha' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Fecha Entrega Esperada" name="expectedDeliveryDate">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Factura Proveedor" name="supplierInvoice">
                <Input placeholder="FACT-001" maxLength={64} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Términos de Pago" name="paymentTerms">
                <Input placeholder="30 días" maxLength={64} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Fecha de Vencimiento" name="dueDate">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Notas" name="notes">
                <Input.TextArea rows={2} placeholder="Notas adicionales..." />
              </Form.Item>
            </Col>
          </Row>

          <Card
            title="Productos"
            extra={
              <Button type="dashed" icon={<PlusOutlined />} onClick={addItem}>
                Agregar Producto
              </Button>
            }
            style={{ marginBottom: 16 }}
          >
            <Table
              columns={itemColumns}
              dataSource={items}
              pagination={false}
              locale={{ emptyText: 'No hay productos agregados' }}
              rowKey="key"
            />

            <Row justify="end" style={{ marginTop: 16 }}>
              <Col span={8}>
                <div style={{ textAlign: 'right', fontSize: '14px' }}>
                  <div style={{ marginBottom: 8 }}>
                    <span>Subtotal: </span>
                    <strong>${totals.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  {totals.discountAmount > 0 && (
                    <div style={{ marginBottom: 8, color: '#52c41a' }}>
                      <span>Descuento: </span>
                      <strong>-${totals.discountAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  )}
                  <div style={{ marginBottom: 8 }}>
                    <span>Impuestos: </span>
                    <strong>${totals.taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={{ fontSize: '18px', borderTop: '2px solid #1890ff', paddingTop: 8 }}>
                    <span>Total: </span>
                    <strong style={{ color: '#1890ff' }}>
                      ${totals.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                Guardar Compra
              </Button>
              <Button onClick={() => navigate('/purchases')}>Cancelar</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PurchaseForm;
