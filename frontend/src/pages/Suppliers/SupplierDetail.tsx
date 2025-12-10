import { Modal, Descriptions, Tag, Rate } from 'antd';

interface SupplierDetailProps {
  visible: boolean;
  supplier: any;
  onClose: () => void;
}

const SupplierDetail = ({ visible, supplier, onClose }: SupplierDetailProps) => {
  if (!supplier) return null;

  return (
    <Modal
      title={`Detalle del Proveedor: ${supplier.code}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Código" span={1}>
          <strong>{supplier.code}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Estado" span={1}>
          <Tag color={supplier.active ? 'success' : 'default'}>
            {supplier.active ? 'Activo' : 'Inactivo'}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Razón Social" span={2}>
          {supplier.businessName}
        </Descriptions.Item>

        <Descriptions.Item label="Nombre Comercial" span={2}>
          {supplier.tradeName || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="RFC" span={1}>
          {supplier.rfc || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Calificación" span={1}>
          <Rate disabled value={supplier.rating || 0} />
        </Descriptions.Item>
      </Descriptions>

      <Descriptions bordered column={2} style={{ marginTop: 16 }} title="Información de Contacto">
        <Descriptions.Item label="Nombre Contacto" span={2}>
          {supplier.contactName || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Email" span={1}>
          {supplier.email || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Teléfono" span={1}>
          {supplier.phone || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Móvil" span={2}>
          {supplier.mobile || '-'}
        </Descriptions.Item>
      </Descriptions>

      <Descriptions bordered column={2} style={{ marginTop: 16 }} title="Dirección">
        <Descriptions.Item label="Calle" span={2}>
          {supplier.street || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Ciudad" span={1}>
          {supplier.city || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Estado" span={1}>
          {supplier.state || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Código Postal" span={2}>
          {supplier.postalCode || '-'}
        </Descriptions.Item>
      </Descriptions>

      <Descriptions bordered column={2} style={{ marginTop: 16 }} title="Información Financiera">
        <Descriptions.Item label="Límite de Crédito" span={1}>
          <strong style={{ color: '#1890ff' }}>
            ${Number(supplier.creditLimit || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Deuda Actual" span={1}>
          <strong style={{ color: Number(supplier.currentDebt || 0) > 0 ? '#ff4d4f' : '#52c41a' }}>
            ${Number(supplier.currentDebt || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Días de Crédito" span={1}>
          {supplier.creditDays || 0} días
        </Descriptions.Item>
        <Descriptions.Item label="Crédito Disponible" span={1}>
          <strong style={{ color: '#52c41a' }}>
            ${(Number(supplier.creditLimit || 0) - Number(supplier.currentDebt || 0)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Términos de Pago" span={2}>
          {supplier.paymentTerms || '-'}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default SupplierDetail;
