import { Descriptions, Table, Tag, Space } from 'antd';
import type { InventoryAdjustment, AdjustmentStatus, AdjustmentType } from '../../types/inventory';

interface AdjustmentDetailProps {
  adjustment: InventoryAdjustment;
}

export default function AdjustmentDetail({ adjustment }: AdjustmentDetailProps) {
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

  const getTypeText = (type: AdjustmentType): string => {
    const texts: Record<AdjustmentType, string> = {
      PHYSICAL_COUNT: 'Conteo Físico',
      DAMAGE: 'Daño',
      LOSS: 'Pérdida',
      CORRECTION: 'Corrección',
    };
    return texts[type] || type;
  };

  const columns = [
    {
      title: 'Lote',
      dataIndex: ['lot', 'lotNumber'],
      key: 'lotNumber',
    },
    {
      title: 'Producto',
      dataIndex: ['lot', 'product', 'name'],
      key: 'product',
    },
    {
      title: 'Cantidad Sistema',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
      align: 'right' as const,
      render: (qty: any) => {
        const num = Number(qty);
        return Number.isFinite(num) ? num.toFixed(2) : '-';
      },
    },
    {
      title: 'Cantidad Física',
      dataIndex: 'physicalQuantity',
      key: 'physicalQuantity',
      align: 'right' as const,
      render: (qty: any) => {
        const num = Number(qty);
        return Number.isFinite(num) ? num.toFixed(2) : '-';
      },
    },
    {
      title: 'Diferencia',
      dataIndex: 'difference',
      key: 'difference',
      align: 'right' as const,
      render: (diff: any) => {
        const num = Number(diff);
        if (!Number.isFinite(num)) return '-';
        return (
          <span style={{ color: num >= 0 ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
            {num >= 0 ? '+' : ''}{num.toFixed(2)}
          </span>
        );
      },
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Código">{adjustment.adjustmentNumber}</Descriptions.Item>
        <Descriptions.Item label="Estado">
          <Tag color={getStatusColor(adjustment.status)}>
            {getStatusText(adjustment.status)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Almacén">{adjustment.warehouse?.name || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Tipo">{getTypeText(adjustment.type)}</Descriptions.Item>
        <Descriptions.Item label="Fecha">
          {new Date(adjustment.adjustmentDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Creado por">
          {adjustment.createdBy || 'N/A'}
        </Descriptions.Item>
        {adjustment.approvedBy && (
          <>
            <Descriptions.Item label="Aprobado por">
              {adjustment.approvedBy}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha Aprobación">
              {adjustment.approvedAt ? new Date(adjustment.approvedAt).toLocaleString() : '-'}
            </Descriptions.Item>
          </>
        )}
        {adjustment.appliedBy && (
          <>
            <Descriptions.Item label="Aplicado por">
              {adjustment.appliedBy}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha Aplicación">
              {adjustment.appliedAt ? new Date(adjustment.appliedAt).toLocaleString() : '-'}
            </Descriptions.Item>
          </>
        )}
        <Descriptions.Item label="Motivo" span={2}>
          {adjustment.reason || '-'}
        </Descriptions.Item>
        {adjustment.notes && (
          <Descriptions.Item label="Notas" span={2}>
            {adjustment.notes}
          </Descriptions.Item>
        )}
      </Descriptions>

      <Table
        columns={columns}
        dataSource={adjustment.items || []}
        rowKey="id"
        pagination={false}
        size="small"
        title={() => <strong>Items del Ajuste</strong>}
      />
    </Space>
  );
}
