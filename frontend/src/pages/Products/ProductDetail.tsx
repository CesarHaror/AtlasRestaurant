import { Modal, Descriptions, Image, Tag, Divider } from 'antd';
import type { Product } from '../../types/product.types';

interface Props {
  open: boolean;
  product: Product;
  onClose: () => void;
}

export default function ProductDetail({ open, product, onClose }: Props) {
  return (
    <Modal
      title="Detalle del Producto"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      className="product-detail-modal"
    >
      <div className="product-detail-section">
        {product.imageUrl && (
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <Image
              src={product.imageUrl}
              alt={product.name}
              style={{ maxWidth: 200, maxHeight: 200, objectFit: 'contain' }}
            />
          </div>
        )}

        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="SKU" span={1}>
            {product.sku}
          </Descriptions.Item>
          <Descriptions.Item label="Código de Barras" span={1}>
            {product.barcode || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Nombre" span={2}>
            {product.name}
          </Descriptions.Item>
          <Descriptions.Item label="Descripción" span={2}>
            {product.description || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Categoría" span={1}>
            {product.category?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Unidad de Medida" span={1}>
            {product.unitOfMeasure?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Precio" span={1}>
            ${product.price.toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="Costo Estándar" span={1}>
            {product.standardCost ? `$${product.standardCost.toFixed(2)}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Estado" span={1}>
            <Tag color={product.isActive ? 'success' : 'default'}>
              {product.isActive ? 'Activo' : 'Inactivo'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tipo" span={1}>
            {product.productType || 'SIMPLE'}
          </Descriptions.Item>
        </Descriptions>

        <Divider>Inventario</Divider>

        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Stock Mínimo" span={1}>
            {product.minStockAlert ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Stock Máximo" span={1}>
            {product.maxStock ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Peso Variable" span={1}>
            <Tag color={product.isVariableWeight ? 'blue' : 'default'}>
              {product.isVariableWeight ? 'Sí' : 'No'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Controlar Inventario" span={1}>
            <Tag color={product.trackInventory ? 'blue' : 'default'}>
              {product.trackInventory ? 'Sí' : 'No'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Controlar Lotes" span={1}>
            <Tag color={product.trackLots ? 'blue' : 'default'}>
              {product.trackLots ? 'Sí' : 'No'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Controlar Caducidad" span={1}>
            <Tag color={product.trackExpiry ? 'blue' : 'default'}>
              {product.trackExpiry ? 'Sí' : 'No'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        {product.requiresRefrigeration && (
          <>
            <Divider>Refrigeración</Divider>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Requiere Refrigeración" span={2}>
                <Tag color="blue">Sí</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Temperatura Mínima" span={1}>
                {product.minTemperature ? `${product.minTemperature}°C` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Temperatura Máxima" span={1}>
                {product.maxTemperature ? `${product.maxTemperature}°C` : '-'}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}

        <Divider>Otros Datos</Divider>

        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Clave SAT Producto" span={1}>
            {product.satProductKey || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Clave SAT Unidad" span={1}>
            {product.satUnitKey || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de Creación" span={1}>
            {new Date(product.createdAt).toLocaleDateString('es-MX')}
          </Descriptions.Item>
          <Descriptions.Item label="Última Actualización" span={1}>
            {new Date(product.updatedAt).toLocaleDateString('es-MX')}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
}
