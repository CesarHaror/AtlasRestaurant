import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Popconfirm,
  message,
  Typography,
  Modal,
  Form,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { companiesApi } from '../../api/admin.api';
import type { Company, CreateCompanyDto, UpdateCompanyDto } from '../../types/restaurants.types';
import { useDebounce } from '../../hooks/useDebounce';

const { Title } = Typography;

export default function CompaniesList() {
  const [companies, setCompanies] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [form] = Form.useForm();

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    loadCompanies();
  }, [debouncedSearch]);

  async function loadCompanies() {
    try {
      setLoading(true);
      const response = await companiesApi.getAll();
      let data = response.data;

      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        data = data.filter(
          (c) =>
            c.businessName.toLowerCase().includes(searchLower) ||
            c.tradeName?.toLowerCase().includes(searchLower) ||
            c.rfc?.toLowerCase().includes(searchLower) ||
            c.email?.toLowerCase().includes(searchLower)
        );
      }

      setCompanies(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOrUpdate(values: any) {
    try {
      if (selectedCompany) {
        await companiesApi.update(selectedCompany.id, values as UpdateCompanyDto);
        message.success('Empresa actualizada');
      } else {
        await companiesApi.create(values as CreateCompanyDto);
        message.success('Empresa creada');
      }
      setFormVisible(false);
      setSelectedCompany(null);
      form.resetFields();
      loadCompanies();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al guardar empresa');
    }
  }

  async function handleDelete(id: number) {
    try {
      await companiesApi.delete(id);
      message.success('Empresa eliminada');
      loadCompanies();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al eliminar empresa');
    }
  }

  function handleEdit(restaurant: Restaurant) {
    setSelectedCompany(restaurant);
    form.setFieldsValue(restaurant);
    setFormVisible(true);
  }

  function handleCreate() {
    setSelectedCompany(null);
    form.resetFields();
    setFormVisible(true);
  }

  const columns: ColumnsType<Restaurant> = [
    {
      title: 'Nombre de Negocio',
      dataIndex: 'businessName',
      key: 'businessName',
      width: 200,
      sorter: (a, b) => a.businessName.localeCompare(b.businessName),
    },
    {
      title: 'Nombre Comercial',
      dataIndex: 'tradeName',
      key: 'tradeName',
      width: 180,
      render: (tradeName) => tradeName || '-',
    },
    {
      title: 'RFC',
      dataIndex: 'rfc',
      key: 'rfc',
      width: 120,
      render: (rfc) => rfc || '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      render: (email) => email || '-',
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (phone) => phone || '-',
    },
    {
      title: 'Ciudad',
      dataIndex: 'city',
      key: 'city',
      width: 120,
      render: (city) => city || '-',
    },
    {
      title: 'Creación',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="¿Eliminar empresa?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleDelete(record.id)}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Gestión de Empresas
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Nueva Empresa
        </Button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <Input
          placeholder="Buscar por nombre, RFC o email..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 300 }}
        />
        <Button icon={<ReloadOutlined />} onClick={loadCompanies}>
          Actualizar
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={companies}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showTotal: (total) => `Total: ${total} empresas`,
        }}
      />

      <Modal
        title={selectedCompany ? 'Editar Empresa' : 'Crear Empresa'}
        open={formVisible}
        onCancel={() => {
          setFormVisible(false);
          setSelectedCompany(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
        >
          <Form.Item
            label="Nombre de Negocio"
            name="businessName"
            rules={[{ required: true, message: 'Ingresa el nombre de negocio' }]}
          >
            <Input placeholder="Nombre de la empresa" />
          </Form.Item>

          <Form.Item
            label="Nombre Comercial"
            name="tradeName"
          >
            <Input placeholder="Nombre comercial" />
          </Form.Item>

          <Form.Item
            label="RFC"
            name="rfc"
          >
            <Input placeholder="RFC" />
          </Form.Item>

          <Form.Item
            label="Régimen Fiscal"
            name="taxRegime"
          >
            <Input placeholder="Régimen fiscal" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', message: 'Email inválido' }]}
          >
            <Input type="email" placeholder="empresa@example.com" />
          </Form.Item>

          <Form.Item
            label="Teléfono"
            name="phone"
          >
            <Input placeholder="Teléfono" />
          </Form.Item>

          <Form.Item
            label="Dirección"
            name="address"
          >
            <Input placeholder="Dirección" />
          </Form.Item>

          <Form.Item
            label="Ciudad"
            name="city"
          >
            <Input placeholder="Ciudad" />
          </Form.Item>

          <Form.Item
            label="Estado"
            name="state"
          >
            <Input placeholder="Estado" />
          </Form.Item>

          <Form.Item
            label="Código Postal"
            name="postalCode"
          >
            <Input placeholder="Código Postal" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button onClick={() => {
              setFormVisible(false);
              setSelectedCompany(null);
              form.resetFields();
            }} style={{ marginRight: 8 }}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              {selectedCompany ? 'Actualizar' : 'Crear'} Empresa
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
