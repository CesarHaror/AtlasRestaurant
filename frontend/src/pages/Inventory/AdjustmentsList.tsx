import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Modal, message } from 'antd';
import { PlusOutlined, EyeOutlined, CheckOutlined } from '@ant-design/icons';
import { getAdjustments, approveAdjustment, applyAdjustment } from '../../services/inventoryApi';
import AdjustmentForm from './AdjustmentForm';
import AdjustmentDetail from './AdjustmentDetail';
import type { InventoryAdjustment, AdjustmentStatus } from '../../types/inventory';
import './Inventory.css';

export default function AdjustmentsList() {
  const [loading, setLoading] = useState(false);
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<InventoryAdjustment | null>(null);

  useEffect(() => {
    loadAdjustments();
  }, []);

  const loadAdjustments = async () => {
    setLoading(true);
    try {
      const data = await getAdjustments();
      setAdjustments(data);
    } catch (error) {
      message.error('Error al cargar ajustes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedAdjustment(null);
    setIsModalOpen(true);
  };

  const handleView = (adjustment: InventoryAdjustment) => {
    setSelectedAdjustment(adjustment);
    setIsDetailOpen(true);
  };

  const handleApprove = async (id: string) => {
    try {
      await approveAdjustment(id);
      message.success('Ajuste aprobado exitosamente');
      loadAdjustments();
    } catch (error) {
      message.error('Error al aprobar ajuste');
    }
  };

  const handleApply = async (id: string) => {
    Modal.confirm({
      title: '¿Aplicar ajuste?',
      content: 'Esta acción actualizará las cantidades de inventario y no se puede deshacer.',
      okText: 'Aplicar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await applyAdjustment(id);
          message.success('Ajuste aplicado exitosamente');
          loadAdjustments();
        } catch (error) {
          message.error('Error al aplicar ajuste');
        }
      },
    });
  };

  const getStatusColor = (status: AdjustmentStatus): string => {
    const colors: Record<AdjustmentStatus, string> = {
      DRAFT: 'default',
      APPROVED: 'processing',
      APPLIED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: AdjustmentStatus): string => {
    const texts: Record<AdjustmentStatus, string> = {
      DRAFT: 'Borrador',
      APPROVED: 'Aprobado',
      APPLIED: 'Aplicado',
      CANCELLED: 'Cancelado',
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Código',
      dataIndex: 'adjustmentNumber',
      key: 'adjustmentNumber',
    },
    {
      title: 'Almacén',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
    },
    {
      title: 'Fecha',
      dataIndex: 'adjustmentDate',
      key: 'adjustmentDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => items?.length || 0,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: AdjustmentStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Motivo',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: InventoryAdjustment) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Ver
          </Button>
          {record.status === 'DRAFT' && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record.id)}
            >
              Aprobar
            </Button>
          )}
          {record.status === 'APPROVED' && (
            <Button
              type="link"
              onClick={() => handleApply(record.id)}
              style={{ color: '#52c41a' }}
            >
              Aplicar
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="inventory-page">
        <Card
          title="Ajustes de Inventario"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Nuevo Ajuste
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={adjustments}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total: number) => `Total: ${total} ajustes`,
            }}
          />
        </Card>

        <Modal
          title="Nuevo Ajuste de Inventario"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={900}
          destroyOnHidden
        >
          <AdjustmentForm
            onSuccess={() => {
              setIsModalOpen(false);
              loadAdjustments();
            }}
          />
        </Modal>

        <Modal
          title="Detalle de Ajuste"
          open={isDetailOpen}
          onCancel={() => setIsDetailOpen(false)}
          footer={null}
          width={900}
          destroyOnHidden
        >
          {selectedAdjustment && (
            <AdjustmentDetail adjustment={selectedAdjustment} />
          )}
        </Modal>
      </div>
  );
}
