import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, message, Popconfirm, Input } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StopOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Warehouse, WarehouseType } from '../../types/inventory';
import { getWarehouses, deleteWarehouse, toggleWarehouseActive } from '../../services/inventoryApi';
import WarehouseForm from './WarehouseForm';
import './Warehouses.css';

const WarehouseList: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const data = await getWarehouses();
      setWarehouses(data);
    } catch (error) {
      message.error('Error al cargar almacenes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingWarehouse(null);
    setIsModalOpen(true);
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWarehouse(id);
      message.success('Almacén eliminado exitosamente');
      fetchWarehouses();
    } catch (error) {
      message.error('Error al eliminar almacén');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleWarehouseActive(id);
      message.success('Estado actualizado exitosamente');
      fetchWarehouses();
    } catch (error) {
      message.error('Error al actualizar estado');
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchWarehouses();
  };

  const getWarehouseTypeLabel = (type: WarehouseType): string => {
    const labels: Record<WarehouseType, string> = {
      [WarehouseType.COLD_STORAGE]: 'Cámara Fría',
      [WarehouseType.DRY_STORAGE]: 'Almacén Seco',
      [WarehouseType.DISPLAY]: 'Exhibición',
      [WarehouseType.FREEZER]: 'Congelador',
    };
    return labels[type];
  };

  const filteredWarehouses = warehouses.filter(
    (warehouse) =>
      warehouse.name.toLowerCase().includes(searchText.toLowerCase()) ||
      warehouse.code.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Warehouse> = [
    {
      title: 'Código',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Tipo',
      dataIndex: 'warehouseType',
      key: 'warehouseType',
      width: 150,
      render: (type: WarehouseType) => (
        <Tag color="blue">{getWarehouseTypeLabel(type)}</Tag>
      ),
    },
    {
      title: 'Control de Temp.',
      dataIndex: 'hasTemperatureControl',
      key: 'hasTemperatureControl',
      width: 150,
      align: 'center',
      render: (hasControl: boolean, record: Warehouse) =>
        hasControl ? (
          <Space direction="vertical" size={0}>
            <Tag color="cyan">Sí</Tag>
            {record.targetTemperature && (
              <span style={{ fontSize: '12px' }}>{record.targetTemperature}°C</span>
            )}
          </Space>
        ) : (
          <Tag>No</Tag>
        ),
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
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
      width: 200,
      align: 'center',
      fixed: 'right',
      render: (_: any, record: Warehouse) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Estás seguro de eliminar este almacén?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Eliminar
            </Button>
          </Popconfirm>
          <Button
            type="link"
            onClick={() => handleToggleActive(record.id)}
            size="small"
          >
            {record.isActive ? 'Desactivar' : 'Activar'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <h2 style={{ margin: 0, color: '#fff' }}>Almacenes</h2>
          <Space>
            <Input
              placeholder="Buscar por código o nombre"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Nuevo Almacén
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredWarehouses}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => (
              <span style={{ color: '#fff' }}>Total: {total} almacenes</span>
            ),
          }}
          scroll={{ x: 1200 }}
        />

        <Modal
          title={editingWarehouse ? 'Editar Almacén' : 'Nuevo Almacén'}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={600}
          destroyOnHidden
        >
          <WarehouseForm
            warehouse={editingWarehouse}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      </div>
  );
};

export default WarehouseList;
