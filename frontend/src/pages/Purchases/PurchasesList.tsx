import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Card, Row, Col, Statistic, Select, Modal, Form, InputNumber, DatePicker, Input } from 'antd';
import { PlusOutlined, ShoppingCartOutlined, CheckOutlined, InboxOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPurchases, approvePurchase, receivePurchase } from '../../services/purchasesApi';
import PurchaseDetail from './PurchaseDetail';
import dayjs from 'dayjs';

const { Option } = Select;

const statusConfig = {
  DRAFT: { label: 'Borrador', color: 'default', icon: '📝' },
  SENT: { label: 'Enviado', color: 'processing', icon: '📤' },
  PARTIAL: { label: 'Parcial', color: 'warning', icon: '📦' },
  RECEIVED: { label: 'Recibido', color: 'success', icon: '✅' },
  CANCELLED: { label: 'Cancelado', color: 'error', icon: '❌' },
};

const PurchasesList = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [receiveForm] = Form.useForm();

  useEffect(() => {
    loadPurchases();
  }, [pagination.current, statusFilter]);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const response = await getPurchases({
        page: pagination.current,
        limit: pagination.pageSize,
        status: statusFilter || undefined,
      });
      const { data = [], total = 0 } = response.data || {};
      setPurchases(data);
      setPagination((prev) => ({ ...prev, total }));
    } catch (error) {
      message.error('Error al cargar compras');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (purchase) => {
    setSelectedPurchase(purchase);
    setApproveModalVisible(true);
  };

  const confirmApprove = async () => {
    try {
      await approvePurchase(selectedPurchase.id);
      message.success('Orden de compra aprobada correctamente');
      setApproveModalVisible(false);
      loadPurchases();
    } catch (error) {
      message.error('Error al aprobar la orden');
      console.error(error);
    }
  };

  const handleReceive = (purchase) => {
    setSelectedPurchase(purchase);
    receiveForm.resetFields();
    // Pre-cargar los items de la compra
    const items = purchase.items?.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantityReceived: item.quantityOrdered - (item.quantityReceived || 0),
      lotNumber: '',
      productionDate: null,
      expiryDate: null,
    })) || [];
    receiveForm.setFieldsValue({ items });
    setReceiveModalVisible(true);
  };

  const confirmReceive = async () => {
    try {
      const values = await receiveForm.validateFields();
      const formattedItems = values.items.map((item) => ({
        purchaseItemId: item.id,
        quantityReceived: item.quantityReceived,
        lotNumber: item.lotNumber,
        productionDate: item.productionDate ? dayjs(item.productionDate).format('YYYY-MM-DD') : undefined,
        expiryDate: item.expiryDate ? dayjs(item.expiryDate).format('YYYY-MM-DD') : undefined,
      }));
      
      await receivePurchase(selectedPurchase.id, { items: formattedItems });
      message.success('Mercancía recibida correctamente');
      setReceiveModalVisible(false);
      loadPurchases();
    } catch (error) {
      message.error('Error al recibir la mercancía');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'No. Compra',
      dataIndex: 'purchaseNumber',
      key: 'purchaseNumber',
      width: 140,
      render: (text) => <strong>{text || '-'}</strong>,
    },
    {
      title: 'Fecha Orden',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Proveedor',
      dataIndex: 'supplierId',
      key: 'supplierId',
      render: (id) => `Proveedor #${id}`,
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      width: 80,
      align: 'center',
      render: (items) => items?.length || 0,
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'right',
      width: 120,
      render: (value) => `$${Number(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Impuestos',
      dataIndex: 'taxAmount',
      key: 'taxAmount',
      align: 'right',
      width: 110,
      render: (value) => `$${Number(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      width: 130,
      render: (value) => (
        <strong style={{ color: '#1890ff' }}>
          ${Number(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </strong>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const config = statusConfig[status] || statusConfig.DRAFT;
        return (
          <Tag color={config.color}>
            {config.icon} {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedPurchase(record);
              setDetailVisible(true);
            }}
          >
            Ver
          </Button>
          {record.status === 'DRAFT' && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record)}
            >
              Aprobar
            </Button>
          )}
          {(record.status === 'SENT' || record.status === 'PARTIAL') && (
            <Button
              type="link"
              size="small"
              icon={<InboxOutlined />}
              onClick={() => handleReceive(record)}
            >
              Recibir
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const totalAmount = purchases.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
  const draftCount = purchases.filter((p) => p.status === 'DRAFT').length;
  const receivedCount = purchases.filter((p) => p.status === 'RECEIVED').length;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={24}>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShoppingCartOutlined />
              Órdenes de Compra
            </h1>
          </Col>
        </Row>
      </div>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Compras" value={pagination.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Borradores" value={draftCount} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Recibidas" value={receivedCount} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Monto Total"
              value={totalAmount}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Select
            placeholder="Filtrar por estado"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => setStatusFilter(value || '')}
          >
            <Option value="DRAFT">📝 Borrador</Option>
            <Option value="SENT">📤 Enviado</Option>
            <Option value="PARTIAL">📦 Parcial</Option>
            <Option value="RECEIVED">✅ Recibido</Option>
            <Option value="CANCELLED">❌ Cancelado</Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/purchases/new')}>
            Nueva Compra
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={purchases}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: false,
            showTotal: (total) => `Total: ${total} compras`,
            onChange: (page) => setPagination((prev) => ({ ...prev, current: page })),
          }}
        />
      </Card>

      {/* Modal de Aprobar */}
      <Modal
        title="Aprobar Orden de Compra"
        open={approveModalVisible}
        onOk={confirmApprove}
        onCancel={() => setApproveModalVisible(false)}
        okText="Aprobar"
        cancelText="Cancelar"
      >
        <p>¿Está seguro que desea aprobar la orden de compra <strong>{selectedPurchase?.purchaseNumber}</strong>?</p>
        <p>Una vez aprobada, la orden será enviada al proveedor.</p>
      </Modal>

      {/* Modal de Recibir Mercancía */}
      <Modal
        title="Recibir Mercancía"
        open={receiveModalVisible}
        onOk={confirmReceive}
        onCancel={() => setReceiveModalVisible(false)}
        okText="Recibir"
        cancelText="Cancelar"
        width={800}
      >
        <p style={{ marginBottom: 16 }}>
          Orden: <strong>{selectedPurchase?.purchaseNumber}</strong>
        </p>
        <Form form={receiveForm} layout="vertical">
          <Form.List name="items">
            {(fields) => (
              <>
                {fields.map((field) => (
                  <Card key={field.key} size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...field}
                          label="Cantidad Recibida"
                          name={[field.name, 'quantityReceived']}
                          rules={[{ required: true, message: 'Requerido' }]}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...field}
                          label="Número de Lote"
                          name={[field.name, 'lotNumber']}
                          rules={[{ required: true, message: 'Requerido' }]}
                        >
                          <Input placeholder="LOT-XXX" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...field}
                          label="Fecha Producción"
                          name={[field.name, 'productionDate']}
                        >
                          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...field}
                          label="Fecha Vencimiento"
                          name={[field.name, 'expiryDate']}
                        >
                          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Modal de Detalle */}
      <PurchaseDetail
        visible={detailVisible}
        purchase={selectedPurchase}
        onClose={() => {
          setDetailVisible(false);
        }}
      />
    </div>
  );
};

export default PurchasesList;
