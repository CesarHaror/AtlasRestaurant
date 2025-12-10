import { Modal, Descriptions, Table, Tag } from 'antd';
import dayjs from 'dayjs';

interface PurchaseDetailProps {
  visible: boolean;
  purchase: any;
  onClose: () => void;
}

const statusConfig = {
  DRAFT: { label: 'Borrador', color: 'default', icon: '📝' },
  SENT: { label: 'Enviado', color: 'processing', icon: '📤' },
  PARTIAL: { label: 'Parcial', color: 'warning', icon: '📦' },
  RECEIVED: { label: 'Recibido', color: 'success', icon: '✅' },
  CANCELLED: { label: 'Cancelado', color: 'error', icon: '❌' },
};

const PurchaseDetail = ({ visible, purchase, onClose }: PurchaseDetailProps) => {
  if (!purchase) return null;

  const config = statusConfig[purchase.status as keyof typeof statusConfig] || statusConfig.DRAFT;

  const itemColumns = [
    {
      title: 'Producto',
      dataIndex: 'productId',
      key: 'productId',
      render: (id: number) => `Producto #${id}`,
    },
    {
      title: 'Cantidad Ordenada',
      dataIndex: 'quantityOrdered',
      key: 'quantityOrdered',
      align: 'center' as const,
      render: (qty: string) => Number(qty).toFixed(2),
    },
    {
      title: 'Cantidad Recibida',
      dataIndex: 'quantityReceived',
      key: 'quantityReceived',
      align: 'center' as const,
      render: (qty: string) => Number(qty || 0).toFixed(2),
    },
    {
      title: 'Costo Unitario',
      dataIndex: 'unitCost',
      key: 'unitCost',
      align: 'right' as const,
      render: (cost: string) => `$${Number(cost).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    },
    {
      title: '% Descuento',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      align: 'center' as const,
      render: (percent: string) => `${Number(percent || 0).toFixed(2)}%`,
    },
    {
      title: '% Impuesto',
      dataIndex: 'taxPercent',
      key: 'taxPercent',
      align: 'center' as const,
      render: (percent: string) => `${Number(percent || 0).toFixed(2)}%`,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right' as const,
      render: (total: string) => (
        <strong style={{ color: '#1890ff' }}>
          ${Number(total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </strong>
      ),
    },
  ];

  return (
    <Modal
      title={`Detalle de Orden de Compra: ${purchase.purchaseNumber}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="No. Orden" span={1}>
          <strong>{purchase.purchaseNumber}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Estado" span={1}>
          <Tag color={config.color}>
            {config.icon} {config.label}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Fecha Orden" span={1}>
          {dayjs(purchase.orderDate).format('DD/MM/YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Fecha Esperada" span={1}>
          {purchase.expectedDate ? dayjs(purchase.expectedDate).format('DD/MM/YYYY') : '-'}
        </Descriptions.Item>

        <Descriptions.Item label="Proveedor" span={1}>
          Proveedor #{purchase.supplierId}
        </Descriptions.Item>
        <Descriptions.Item label="Almacén" span={1}>
          Almacén #{purchase.warehouseId}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 24, marginBottom: 16 }}>
        <h3>Items de la Orden</h3>
      </div>

      <Table
        columns={itemColumns}
        dataSource={purchase.items || []}
        rowKey="id"
        pagination={false}
        size="small"
      />

      <Descriptions bordered column={2} style={{ marginTop: 24 }}>
        <Descriptions.Item label="Subtotal" span={1}>
          ${Number(purchase.subtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </Descriptions.Item>
        <Descriptions.Item label="Descuento" span={1}>
          <span style={{ color: '#52c41a' }}>
            -${Number(purchase.discountAmount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Impuestos" span={1}>
          ${Number(purchase.taxAmount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </Descriptions.Item>
        <Descriptions.Item label="Total" span={1}>
          <strong style={{ fontSize: '16px', color: '#1890ff' }}>
            ${Number(purchase.totalAmount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </strong>
        </Descriptions.Item>
      </Descriptions>

      {purchase.notes && (
        <Descriptions bordered column={1} style={{ marginTop: 16 }}>
          <Descriptions.Item label="Notas">
            {purchase.notes}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};

export default PurchaseDetail;
