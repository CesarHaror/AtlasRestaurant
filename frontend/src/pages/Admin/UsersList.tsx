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
  Switch,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  LockOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { usersApi } from '../../api/admin.api';
import { branchesApi } from '../../api/admin.api';
import type { User, Branch } from '../../types/restaurants.types';
import { useDebounce } from '../../hooks/useDebounce';

const { Title } = Typography;

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [passwordFormVisible, setPasswordFormVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [passwordUserId, setPasswordUserId] = useState<string>('');

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [page, debouncedSearch]);

  async function loadBranches() {
    try {
      const response = await branchesApi.getAll();
      setBranches(response.data || []);
    } catch (error: any) {
      console.error('Error al cargar sucursales:', error);
    }
  }

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await usersApi.getAll(page, limit, debouncedSearch || undefined);
      setUsers(response.data.data);
      setTotal(response.data.total);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOrUpdate(values: any) {
    try {
      if (selectedUser) {
        await usersApi.update(selectedUser.id, values);
        message.success('Usuario actualizado');
      } else {
        await usersApi.create(values);
        message.success('Usuario creado');
      }
      setFormVisible(false);
      setSelectedUser(null);
      form.resetFields();
      loadUsers();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al guardar usuario');
    }
  }

  async function handleDelete(id: string) {
    try {
      await usersApi.delete(id);
      message.success('Usuario eliminado');
      loadUsers();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al eliminar usuario');
    }
  }

  async function handleToggleActive(id: string) {
    try {
      await usersApi.toggleActive(id);
      message.success('Estado del usuario actualizado');
      loadUsers();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al actualizar usuario');
    }
  }

  async function handleChangePassword(values: any) {
    try {
      await usersApi.updatePassword(passwordUserId, values.currentPassword, values.newPassword);
      message.success('Contraseña actualizada');
      setPasswordFormVisible(false);
      passwordForm.resetFields();
      setPasswordUserId('');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al cambiar contraseña');
    }
  }

  function handleEdit(user: User) {
    setSelectedUser(user);
    form.setFieldsValue({
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      branchId: user.branchId,
    });
    setFormVisible(true);
  }

  function handleCreate() {
    setSelectedUser(null);
    form.resetFields();
    setFormVisible(true);
  }

  const columns: ColumnsType<User> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Usuario',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: 'Nombre',
      key: 'fullName',
      width: 180,
      render: (_, record) => {
        const fullName = [record.firstName, record.lastName].filter(Boolean).join(' ');
        return fullName || '-';
      },
    },
    {
      title: 'Rol',
      key: 'roles',
      width: 150,
      render: (_, record) => {
        return record.roles?.map((r) => r.name).join(', ') || '-';
      },
    },
    {
      title: 'Sucursal',
      dataIndex: 'branchId',
      key: 'branchId',
      width: 150,
      render: (branchId) => {
        if (!branchId) return '-';
        const branch = branches.find((b) => b.id === branchId);
        return branch?.name || `-`;
      },
    },
    {
      title: 'Activo',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record.id)}
        />
      ),
    },
    {
      title: 'Último Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
      render: (lastLogin) =>
        lastLogin ? dayjs(lastLogin).format('DD/MM/YYYY HH:mm') : 'Nunca',
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<LockOutlined />}
            onClick={() => {
              setPasswordUserId(record.id);
              setPasswordFormVisible(true);
            }}
            size="small"
            title="Cambiar contraseña"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="¿Eliminar usuario?"
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
          Gestión de Usuarios
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Nuevo Usuario
        </Button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <Input
          placeholder="Buscar por email o usuario..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          allowClear
          style={{ width: 300 }}
        />
        <Button icon={<ReloadOutlined />} onClick={loadUsers}>
          Actualizar
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total: total,
          onChange: setPage,
          showTotal: (total) => `Total: ${total} usuarios`,
        }}
      />

      <Modal
        title={selectedUser ? 'Editar Usuario' : 'Crear Usuario'}
        open={formVisible}
        onCancel={() => {
          setFormVisible(false);
          setSelectedUser(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
        >
          {!selectedUser && (
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Ingresa el email' },
                { type: 'email', message: 'Email inválido' },
              ]}
            >
              <Input type="email" placeholder="usuario@example.com" />
            </Form.Item>
          )}

          {!selectedUser && (
            <Form.Item
              label="Usuario"
              name="username"
              rules={[{ required: true, message: 'Ingresa el nombre de usuario' }]}
            >
              <Input placeholder="nombre_usuario" />
            </Form.Item>
          )}

          {!selectedUser && (
            <Form.Item
              label="Contraseña"
              name="password"
              rules={[
                { required: true, message: 'Ingresa una contraseña' },
                { min: 6, message: 'Mínimo 6 caracteres' },
              ]}
            >
              <Input.Password placeholder="Contraseña" />
            </Form.Item>
          )}

          <Form.Item
            label="Nombre"
            name="firstName"
          >
            <Input placeholder="Nombre" />
          </Form.Item>

          <Form.Item
            label="Apellido"
            name="lastName"
          >
            <Input placeholder="Apellido" />
          </Form.Item>

          <Form.Item
            label="Sucursal"
            name="branchId"
          >
            <Select
              placeholder="Selecciona una sucursal (opcional)"
              allowClear
              options={branches.map((branch) => ({
                label: branch.name,
                value: branch.id,
              }))}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button onClick={() => {
              setFormVisible(false);
              setSelectedUser(null);
              form.resetFields();
            }} style={{ marginRight: 8 }}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              {selectedUser ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Cambiar Contraseña"
        open={passwordFormVisible}
        onCancel={() => {
          setPasswordFormVisible(false);
          passwordForm.resetFields();
          setPasswordUserId('');
        }}
        footer={null}
        width={500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="Contraseña Actual"
            name="currentPassword"
            rules={[{ required: true, message: 'Ingresa la contraseña actual' }]}
          >
            <Input.Password placeholder="Contraseña actual" />
          </Form.Item>

          <Form.Item
            label="Nueva Contraseña"
            name="newPassword"
            rules={[
              { required: true, message: 'Ingresa la nueva contraseña' },
              { min: 6, message: 'Mínimo 6 caracteres' },
            ]}
          >
            <Input.Password placeholder="Nueva contraseña" />
          </Form.Item>

          <Form.Item
            label="Confirmar Contraseña"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Confirma la contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirmar contraseña" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button onClick={() => {
              setPasswordFormVisible(false);
              passwordForm.resetFields();
              setPasswordUserId('');
            }} style={{ marginRight: 8 }}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              Cambiar Contraseña
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
