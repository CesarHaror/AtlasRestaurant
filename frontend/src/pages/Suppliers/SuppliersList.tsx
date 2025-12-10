import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Modal, Input, Card, Row, Col, Statistic } from 'antd';
import { PlusOutlined, SearchOutlined, ShopOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { getSuppliers } from '../../services/purchasesApi';
import SupplierForm from './SupplierForm';
import SupplierDetail from './SupplierDetail';

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async (search = '') => {
    setLoading(true);
    try {
      const response = await getSuppliers({ q: search, limit: 50 });
      setSuppliers(response.data || []);
    } catch (error) {
      message.error('Error al cargar proveedores');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    loadSuppliers(value);
  };

  const handleCreateSuccess = () => {
    setIsModalVisible(false);
    setEditingSupplier(null);
    loadSuppliers(searchText);
    message.success(editingSupplier ? 'Proveedor actualizado exitosamente' : 'Proveedor creado exitosamente');
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setEditingSupplier(null);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Código',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Razón Social',
      dataIndex: 'businessName',
      key: 'businessName',
    },
    {
      title: 'Nombre Comercial',
      dataIndex: 'tradeName',
      key: 'tradeName',
    },
    {
      title: 'RFC',
      dataIndex: 'rfc',
      key: 'rfc',
      width: 150,
    },
    {
      title: 'Contacto',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>{record.contactName}</div>
          {record.email && <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>}
          {record.phone && <div style={{ fontSize: '12px', color: '#666' }}>{record.phone}</div>}
        </div>
      ),
    },
    {
      title: 'Límite Crédito',
      dataIndex: 'creditLimit',
      key: 'creditLimit',
      align: 'right',
      width: 120,
      render: (value) => `$${Number(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Deuda Actual',
      dataIndex: 'currentDebt',
      key: 'currentDebt',
      align: 'right',
      width: 120,
      render: (value) => {
        const debt = Number(value || 0);
        return (
          <span style={{ color: debt > 0 ? '#ff4d4f' : '#52c41a' }}>
            ${debt.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      title: 'Calificación',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (rating) => '⭐'.repeat(rating || 0),
    },
    {
      title: 'Estado',
      dataIndex: 'active',
      key: 'active',
      width: 80,
      render: (active) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedSupplier(record);
              setDetailVisible(true);
            }}
          >
            Ver
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>
        </Space>
      ),
    },
  ];

  const activeSuppliers = suppliers.filter((s) => s.active);
  const totalCreditLimit = suppliers.reduce((sum, s) => sum + Number(s.creditLimit || 0), 0);
  const totalDebt = suppliers.reduce((sum, s) => sum + Number(s.currentDebt || 0), 0);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={24}>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShopOutlined />
              Proveedores
            </h1>
          </Col>
        </Row>
      </div>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Proveedores" value={suppliers.length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Activos" value={activeSuppliers.length} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Límite Crédito Total"
              value={totalCreditLimit}
              precision={2}
              prefix="$"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Deuda Total"
              value={totalDebt}
              precision={2}
              prefix="$"
              valueStyle={{ color: totalDebt > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="Buscar por nombre o razón social..."
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 400 }}
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && handleSearch('')}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Nuevo Proveedor
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={suppliers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: false,
            showTotal: (total) => `Total: ${total} proveedores`,
          }}
        />
      </Card>

      <Modal
        title={editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingSupplier(null);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <SupplierForm 
          supplier={editingSupplier}
          onSuccess={handleCreateSuccess} 
          onCancel={() => {
            setIsModalVisible(false);
            setEditingSupplier(null);
          }} 
        />
      </Modal>

      <SupplierDetail
        visible={detailVisible}
        supplier={selectedSupplier}
        onClose={() => {
          setDetailVisible(false);
          setSelectedSupplier(null);
        }}
      />
    </div>
  );
};

export default SuppliersList;
