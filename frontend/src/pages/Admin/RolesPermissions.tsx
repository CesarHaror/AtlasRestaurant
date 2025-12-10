import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Checkbox,
  Space,
  Popconfirm,
  message,
  Spin,
  Tabs,
  Card,
  Row,
  Col,
  Tag,
  Divider,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { permissionsApi } from '../../api/permissions.api';
import {
  Permission,
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  PermissionsResponse,
} from '../../types/permissions.types';

const RolesPermissions: React.FC = () => {
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsGrouped, setPermissionsGrouped] = useState<Record<string, Permission[]>>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('roles');

  // Load roles and permissions
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        permissionsApi.getRoles(),
        permissionsApi.getPermissions(),
      ]);

      setRoles(rolesData);
      setPermissions(permissionsData.flat);
      setPermissionsGrouped(permissionsData.grouped);
    } catch (error) {
      message.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Open modal for creating new role
  const showCreateModal = () => {
    form.resetFields();
    setEditingRole(null);
    setSelectedPermissions([]);
    setModalVisible(true);
  };

  // Open modal for editing role
  const showEditModal = (role: Role) => {
    form.setFieldsValue({
      name: role.name,
      description: role.description,
    });
    setEditingRole(role);
    setSelectedPermissions(role.permissions.map((p) => p.id));
    setModalVisible(true);
  };

  // Handle save role
  const handleSaveRole = async (values: any) => {
    try {
      const dto = {
        name: values.name,
        description: values.description,
        permissionIds: selectedPermissions,
      };

      if (editingRole) {
        await permissionsApi.updateRole(editingRole.id, dto as UpdateRoleDto);
        message.success('Rol actualizado correctamente');
      } else {
        await permissionsApi.createRole(dto as CreateRoleDto);
        message.success('Rol creado correctamente');
      }

      setModalVisible(false);
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al guardar rol');
    }
  };

  // Handle delete role
  const handleDeleteRole = async (id: string) => {
    try {
      await permissionsApi.deleteRole(id);
      message.success('Rol eliminado correctamente');
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al eliminar rol');
    }
  };

  // Handle toggle role status
  const handleToggleStatus = async (id: string) => {
    try {
      await permissionsApi.toggleRoleStatus(id);
      message.success('Estado del rol actualizado');
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al actualizar estado');
    }
  };

  // Render roles table
  const rolesColumns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Role) => (
        <Space>
          <span>{text}</span>
          {record.isSystem && <Tag color="blue">Sistema</Tag>}
        </Space>
      ),
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Permisos',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (perms: Permission[]) => (
        <Tag color="cyan">{perms.length} permisos</Tag>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Role) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            disabled={record.isSystem}
          />
          <Button
            type="default"
            size="small"
            icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleStatus(record.id)}
            disabled={record.isSystem}
          />
          <Popconfirm
            title="¿Eliminar rol?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleDeleteRole(record.id)}
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={record.isSystem}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ padding: '24px' }}>
        <Card title="Gestión de Roles y Permisos">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'roles',
                label: 'Roles',
                children: (
                  <>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={showCreateModal}
                      style={{ marginBottom: '16px' }}
                    >
                      Crear Rol
                    </Button>
                    <Table
                      columns={rolesColumns}
                      dataSource={roles}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                    />
                  </>
                ),
              },
              {
                key: 'permissions',
                label: 'Permisos',
                children: (
                  <Row gutter={[16, 16]}>
                    {Object.entries(permissionsGrouped).map(([module, perms]) => (
                      <Col key={module} xs={24} sm={12} md={8} lg={6}>
                        <Card
                          title={
                            <Tag color="blue" style={{ marginRight: 0 }}>
                              {module}
                            </Tag>
                          }
                          size="small"
                        >
                          {perms.map((perm) => (
                            <div
                              key={perm.id}
                              style={{
                                padding: '4px 0',
                                borderBottom: '1px solid #f0f0f0',
                              }}
                            >
                              <div style={{ fontSize: '12px', fontWeight: 500 }}>
                                {perm.action}
                              </div>
                              <div style={{ fontSize: '11px', color: '#666' }}>
                                {perm.name}
                              </div>
                            </div>
                          ))}
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ),
              },
            ]}
          />
        </Card>

        {/* Create/Edit Role Modal */}
        <Modal
          title={editingRole ? 'Editar Rol' : 'Crear Rol'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={() => form.submit()}
          width={700}
        >
          <Form form={form} onFinish={handleSaveRole} layout="vertical">
            <Form.Item
              name="name"
              label="Nombre"
              rules={[{ required: true, message: 'Ingrese el nombre del rol' }]}
            >
              <Input placeholder="Ej: Supervisor" />
            </Form.Item>

            <Form.Item name="description" label="Descripción">
              <Input.TextArea placeholder="Descripción del rol" rows={3} />
            </Form.Item>

            <Divider>Permisos</Divider>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Row gutter={[16, 16]}>
                {Object.entries(permissionsGrouped).map(([module, perms]) => (
                  <Col key={module} xs={24} sm={12}>
                    <Card size="small" title={<Tag color="blue">{module}</Tag>}>
                      {perms.map((perm) => (
                        <div
                          key={perm.id}
                          style={{
                            marginBottom: '8px',
                            paddingBottom: '8px',
                            borderBottom: '1px solid #f0f0f0',
                          }}
                        >
                          <Checkbox
                            checked={selectedPermissions.includes(perm.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPermissions([
                                  ...selectedPermissions,
                                  perm.id,
                                ]);
                              } else {
                                setSelectedPermissions(
                                  selectedPermissions.filter((id) => id !== perm.id)
                                );
                              }
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 500 }}>
                                {perm.action}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {perm.name}
                              </div>
                            </div>
                          </Checkbox>
                        </div>
                      ))}
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </Form>
        </Modal>
      </div>
    </Spin>
  );
};

export default RolesPermissions;
