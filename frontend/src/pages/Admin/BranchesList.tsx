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
  Select,
  Switch,
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
import { branchesApi, companiesApi } from '../../api/admin.api';
import type { Branch, Company, CreateBranchDto, UpdateBranchDto } from '../../types/restaurants.types';
import { useDebounce } from '../../hooks/useDebounce';

const { Title } = Typography;

export default function BranchesList() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [companies, setCompanies] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [form] = Form.useForm();

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    loadBranches();
  }, [debouncedSearch]);

  async function loadCompanies() {
    try {
      const response = await companiesApi.getAll();
      setCompanies(response.data);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  }

  async function loadBranches() {
    try {
      setLoading(true);
      const response = await branchesApi.getAll();
      let data = response.data;

      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        data = data.filter(
          (b) =>
            b.name.toLowerCase().includes(searchLower) ||
            b.phone?.toLowerCase().includes(searchLower) ||
            b.email?.toLowerCase().includes(searchLower)
        );
      }

      setBranches(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al cargar sucursales');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOrUpdate(values: any) {
    try {
      // Filtrar solo los campos aceptados por el backend
      const cleanedValues = {
        companyId: values.companyId,
        name: values.name,
        phone: values.phone,
        address: values.address,
      };
      
      if (selectedBranch) {
        await branchesApi.update(selectedBranch.id, cleanedValues as UpdateBranchDto);
        message.success('Sucursal actualizada');
      } else {
        await branchesApi.create(cleanedValues as CreateBranchDto);
        message.success('Sucursal creada');
      }
      setFormVisible(false);
      setSelectedBranch(null);
      form.resetFields();
      loadBranches();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al guardar sucursal');
    }
  }

  async function handleDelete(id: number) {
    try {
      await branchesApi.delete(id);
      message.success('Sucursal eliminada');
      loadBranches();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al eliminar sucursal');
    }
  }

  function handleEdit(branch: Branch) {
    setSelectedBranch(branch);
    form.setFieldsValue(branch);
    setFormVisible(true);
  }

  function handleCreate() {
    setSelectedBranch(null);
    form.resetFields();
    setFormVisible(true);
  }

  const columns: ColumnsType<Branch> = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Empresa',
      key: 'company',
      width: 150,
      render: (_, record) => {
        const restaurant = companies.find((c) => c.id === record.companyId);
        return company?.businessName || '-';
      },
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
      title: 'Activa',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Switch checked={isActive} disabled />
      ),
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
            title="¿Eliminar sucursal?"
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
          Gestión de Sucursales
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Nueva Sucursal
        </Button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <Input
          placeholder="Buscar por nombre, teléfono o email..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 300 }}
        />
        <Button icon={<ReloadOutlined />} onClick={loadBranches}>
          Actualizar
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={branches}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showTotal: (total) => `Total: ${total} sucursales`,
        }}
      />

      <Modal
        title={selectedBranch ? 'Editar Sucursal' : 'Crear Sucursal'}
        open={formVisible}
        onCancel={() => {
          setFormVisible(false);
          setSelectedBranch(null);
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
            label="Empresa"
            name="companyId"
            rules={[{ required: true, message: 'Selecciona una empresa' }]}
          >
            <Select placeholder="Selecciona empresa">
              {companies.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.businessName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Nombre"
            name="name"
            rules={[{ required: true, message: 'Ingresa el nombre de la sucursal' }]}
          >
            <Input placeholder="Nombre de la sucursal" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', message: 'Email inválido' }]}
          >
            <Input type="email" placeholder="sucursal@example.com" />
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
              setSelectedBranch(null);
              form.resetFields();
            }} style={{ marginRight: 8 }}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              {selectedBranch ? 'Actualizar' : 'Crear'} Sucursal
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
