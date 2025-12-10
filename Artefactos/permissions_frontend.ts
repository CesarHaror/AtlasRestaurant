// =====================================================
// GESTIÓN DE PERMISOS Y ROLES - FRONTEND
// React + TypeScript + Ant Design
// =====================================================

// ============= TYPES =============

// types/permissions.types.ts
export interface Permission {
  id: string;
  module: string;
  action: string;
  name: string;
  description?: string;
  isSystem: boolean;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  permissions: Permission[];
  users?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface PermissionsGrouped {
  [module: string]: Permission[];
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds: string[];
}

// ============= API =============

// api/permissions.api.ts
import apiClient from './client';
import { Role, Permission, CreateRoleDto } from '../types/permissions.types';

export const permissionsAPI = {
  // Permisos
  getPermissions: async (module?: string) => {
    const params = module ? { module } : {};
    return apiClient.get<{
      permissions: Permission[];
      grouped: { [key: string]: Permission[] };
    }>('/permissions/list', { params });
  },

  // Roles
  getRoles: async () => {
    return apiClient.get<Role[]>('/permissions/roles');
  },

  getRole: async (id: string) => {
    return apiClient.get<Role>(`/permissions/roles/${id}`);
  },

  createRole: async (data: CreateRoleDto) => {
    return apiClient.post<Role>('/permissions/roles', data);
  },

  updateRole: async (id: string, data: Partial<CreateRoleDto>) => {
    return apiClient.patch<Role>(`/permissions/roles/${id}`, data);
  },

  deleteRole: async (id: string) => {
    return apiClient.delete(`/permissions/roles/${id}`);
  },

  toggleRoleStatus: async (id: string) => {
    return apiClient.patch<Role>(`/permissions/roles/${id}/toggle-status`);
  },
};

// ============= PÁGINA PRINCIPAL =============

// pages/Settings/RolesPermissions.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Checkbox,
  message,
  Popconfirm,
  Divider,
  Typography,
  Row,
  Col,
  Badge,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  StopOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { permissionsAPI } from '../../api/permissions.api';
import { Role, Permission } from '../../types/permissions.types';

const { Title, Text } = Typography;

const RolesPermissions: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        permissionsAPI.getRoles(),
        permissionsAPI.getPermissions(),
      ]);

      setRoles(rolesData);
      setPermissions(permissionsData.permissions);
      setGroupedPermissions(permissionsData.grouped);
    } catch (error: any) {
      message.error('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      permissionIds: role.permissions.map((p) => p.id),
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await permissionsAPI.deleteRole(id);
      message.success('Rol eliminado exitosamente');
      loadData();
    } catch (error: any) {
      message.error('Error al eliminar: ' + error.response?.data?.message);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await permissionsAPI.toggleRoleStatus(id);
      message.success('Estado actualizado');
      loadData();
    } catch (error: any) {
      message.error('Error: ' + error.response?.data?.message);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRole) {
        await permissionsAPI.updateRole(editingRole.id, values);
        message.success('Rol actualizado exitosamente');
      } else {
        await permissionsAPI.createRole(values);
        message.success('Rol creado exitosamente');
      }
      setModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error: any) {
      message.error('Error: ' + error.response?.data?.message);
    }
  };

  // Mapeo de módulos a nombres amigables
  const MODULE_NAMES: { [key: string]: string } = {
    dashboard: '📊 Dashboard',
    products: '📦 Productos',
    suppliers: '🏭 Proveedores',
    purchases: '🛒 Compras',
    sales: '💰 Ventas',
    pos: '🖥️ Punto de Venta',
    inventory: '📋 Inventario',
    reports: '📈 Reportes',
    users: '👥 Usuarios',
    settings: '⚙️ Configuración',
  };

  // Mapeo de acciones a colores
  const ACTION_COLORS: { [key: string]: string } = {
    view: 'blue',
    create: 'green',
    edit: 'orange',
    delete: 'red',
    approve: 'purple',
    access: 'cyan',
  };

  const columns = [
    {
      title: 'Nombre del Rol',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Role) => (
        <Space>
          {record.isSystem && (
            <Tooltip title="Rol del sistema (no editable)">
              <SafetyOutlined style={{ color: '#faad14' }} />
            </Tooltip>
          )}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || <Text type="secondary">Sin descripción</Text>,
    },
    {
      title: 'Permisos',
      key: 'permissions',
      render: (_: any, record: Role) => (
        <Badge count={record.permissions?.length || 0} showZero>
          <Button type="link" size="small">
            Ver permisos
          </Button>
        </Badge>
      ),
    },
    {
      title: 'Usuarios',
      key: 'users',
      render: (_: any, record: Role) => (
        <Tag color="blue">{record.users?.length || 0} usuarios</Tag>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) =>
        isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Activo
          </Tag>
        ) : (
          <Tag icon={<StopOutlined />} color="default">
            Inactivo
          </Tag>
        ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Role) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={record.isSystem}
            />
          </Tooltip>

          <Tooltip title={record.isActive ? 'Desactivar' : 'Activar'}>
            <Popconfirm
              title={`¿${record.isActive ? 'Desactivar' : 'Activar'} este rol?`}
              onConfirm={() => handleToggleStatus(record.id)}
              disabled={record.isSystem}
            >
              <Button
                type="text"
                icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
                disabled={record.isSystem}
              />
            </Popconfirm>
          </Tooltip>

          <Tooltip title="Eliminar">
            <Popconfirm
              title="¿Está seguro de eliminar este rol?"
              description="Esta acción no se puede deshacer"
              onConfirm={() => handleDelete(record.id)}
              disabled={record.isSystem}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={record.isSystem}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            <SafetyOutlined /> Roles y Permisos
          </Title>
          <Text type="secondary">
            Gestiona los roles y permisos del sistema
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
          >
            Crear Rol
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} roles`,
          }}
        />
      </Card>

      {/* Modal de Crear/Editar */}
      <Modal
        title={
          editingRole ? (
            <Space>
              <EditOutlined />
              Editar Rol
            </Space>
          ) : (
            <Space>
              <PlusOutlined />
              Crear Nuevo Rol
            </Space>
          )
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={900}
        okText={editingRole ? 'Actualizar' : 'Crear'}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Nombre del Rol"
                rules={[
                  { required: true, message: 'El nombre es requerido' },
                  { max: 50, message: 'Máximo 50 caracteres' },
                ]}
              >
                <Input placeholder="Ej: Cajero Senior" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="description" label="Descripción">
                <Input placeholder="Descripción opcional del rol" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">
            <Space>
              <InfoCircleOutlined />
              Asignar Permisos
            </Space>
          </Divider>

          <Form.Item
            name="permissionIds"
            rules={[
              {
                required: true,
                message: 'Debe seleccionar al menos un permiso',
              },
            ]}
          >
            <Checkbox.Group style={{ width: '100%' }}>
              {Object.keys(groupedPermissions).map((module) => (
                <Card
                  key={module}
                  size="small"
                  title={
                    <Space>
                      <Text strong>{MODULE_NAMES[module] || module}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        ({groupedPermissions[module].length} permisos)
                      </Text>
                    </Space>
                  }
                  style={{ marginBottom: 16 }}
                  headStyle={{ backgroundColor: '#fafafa' }}
                >
                  <Row gutter={[16, 8]}>
                    {groupedPermissions[module].map((perm: Permission) => (
                      <Col span={12} key={perm.id}>
                        <Checkbox value={perm.id}>
                          <Space>
                            <Tag color={ACTION_COLORS[perm.action] || 'default'}>
                              {perm.action}
                            </Tag>
                            {perm.name}
                          </Space>
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Card>
              ))}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RolesPermissions;

// ============= HOOK PARA VERIFICAR PERMISOS =============

// hooks/usePermissions.ts
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (user?.role?.permissions) {
      const permList = user.role.permissions.map(
        (p: any) => `${p.module}.${p.action}`
      );
      setPermissions(permList);
    }
  }, [user]);

  const hasPermission = (module: string, action: string): boolean => {
    return permissions.includes(`${module}.${action}`);
  };

  const hasAnyPermission = (checks: Array<{ module: string; action: string }>): boolean => {
    return checks.some(({ module, action }) =>
      permissions.includes(`${module}.${action}`)
    );
  };

  const hasAllPermissions = (checks: Array<{ module: string; action: string }>): boolean => {
    return checks.every(({ module, action }) =>
      permissions.includes(`${module}.${action}`)
    );
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions,
  };
};

// ============= COMPONENTE CONDICIONAL =============

// components/PermissionGuard.tsx
import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Result, Button } from 'antd';
import { LockOutlined } from '@ant-design/icons';

interface PermissionGuardProps {
  module: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  action,
  children,
  fallback,
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(module, action)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Result
        status="403"
        title="Acceso Denegado"
        subTitle="No tienes permisos para acceder a esta sección"
        icon={<LockOutlined />}
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Volver
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
};

// ============= EJEMPLO DE USO =============

// Ejemplo 1: Proteger una página completa
/*
import { PermissionGuard } from '../components/PermissionGuard';

function ProductsPage() {
  return (
    <PermissionGuard module="products" action="view">
      <div>
        <h1>Productos</h1>
        // ... contenido
      </div>
    </PermissionGuard>
  );
}
*/

// Ejemplo 2: Mostrar/ocultar botones
/*
import { usePermissions } from '../hooks/usePermissions';

function ProductList() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      {hasPermission('products', 'create') && (
        <Button type="primary">Crear Producto</Button>
      )}
      
      {hasPermission('products', 'edit') && (
        <Button>Editar</Button>
      )}
      
      {hasPermission('products', 'delete') && (
        <Button danger>Eliminar</Button>
      )}
    </div>
  );
}
*/

// Ejemplo 3: Columnas condicionales en tabla
/*
const columns = [
  {
    title: 'Nombre',
    dataIndex: 'name',
  },
  // Solo mostrar columna de acciones si tiene permisos
  ...(hasPermission('products', 'edit') || hasPermission('products', 'delete')
    ? [
        {
          title: 'Acciones',
          render: (record: any) => (
            <Space>
              {hasPermission('products', 'edit') && (
                <Button>Editar</Button>
              )}
              {hasPermission('products', 'delete') && (
                <Button danger>Eliminar</Button>
              )}
            </Space>
          ),
        },
      ]
    : []),
];
*/

// ============= MENÚ DINÁMICO BASADO EN PERMISOS =============

// components/DynamicMenu.tsx
import React, { useMemo } from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  DollarOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { usePermissions } from '../hooks/usePermissions';

export const DynamicMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermissions();

  const menuItems = useMemo(() => {
    const items = [];

    // Dashboard
    if (hasPermission('dashboard', 'view')) {
      items.push({
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      });
    }

    // Productos
    if (hasPermission('products', 'view')) {
      items.push({
        key: '/products',
        icon: <ShoppingCartOutlined />,
        label: 'Productos',
      });
    }

    // POS
    if (hasPermission('pos', 'access')) {
      items.push({
        key: '/pos',
        icon: <ShopOutlined />,
        label: 'Punto de Venta',
      });
    }

    // Ventas
    if (hasPermission('sales', 'view')) {
      items.push({
        key: '/sales',
        icon: <DollarOutlined />,
        label: 'Ventas',
      });
    }

    // Inventario
    if (hasPermission('inventory', 'view')) {
      items.push({
        key: '/inventory',
        icon: <FileTextOutlined />,
        label: 'Inventario',
      });
    }

    // Reportes
    if (hasPermission('reports', 'view')) {
      items.push({
        key: '/reports',
        icon: <BarChartOutlined />,
        label: 'Reportes',
      });
    }

    // Usuarios
    if (hasPermission('users', 'view')) {
      items.push({
        key: '/users',
        icon: <UserOutlined />,
        label: 'Usuarios',
      });
    }

    // Configuración
    if (hasPermission('settings', 'view')) {
      items.push({
        key: '/settings',
        icon: <SettingOutlined />,
        label: 'Configuración',
        children: [
          {
            key: '/settings/roles',
            label: 'Roles y Permisos',
          },
          {
            key: '/settings/companies',
            label: 'Empresas',
          },
          {
            key: '/settings/branches',
            label: 'Sucursales',
          },
        ],
      });
    }

    return items;
  }, [hasPermission]);

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={({ key }) => navigate(key)}
    />
  );
};
