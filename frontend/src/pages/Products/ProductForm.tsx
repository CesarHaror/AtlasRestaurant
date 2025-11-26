import { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  message,
  Row,
  Col,
} from 'antd';
import { productsApi } from '../../api/products.api';
import type {
  Product,
  ProductCategory,
  UnitOfMeasure,
  CreateProductDto,
  UpdateProductDto,
} from '../../types/product.types';

interface Props {
  open: boolean;
  product: Product | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ open, product, onCancel, onSuccess }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);

  useEffect(() => {
    if (open) {
      loadCatalogues();
      if (product) {
        form.setFieldsValue({
          sku: product.sku,
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          unitOfMeasureId: product.unitOfMeasureId,
          price: product.price,
          standardCost: product.standardCost,
          barcode: product.barcode,
          minStockAlert: product.minStockAlert,
          maxStock: product.maxStock,
          isVariableWeight: product.isVariableWeight,
          trackInventory: product.trackInventory,
          trackLots: product.trackLots,
          trackExpiry: product.trackExpiry,
          requiresRefrigeration: product.requiresRefrigeration,
          minTemperature: product.minTemperature,
          maxTemperature: product.maxTemperature,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, product]);

  async function loadCatalogues() {
    try {
      const [cats, unts] = await Promise.all([
        productsApi.getCategories(),
        productsApi.getUnitsOfMeasure(),
      ]);
      setCategories(cats);
      setUnits(unts);
    } catch (error) {
      message.error('Error al cargar catálogos');
    }
  }

  async function handleSubmit(values: any) {
    try {
      setLoading(true);
      const dto: CreateProductDto | UpdateProductDto = {
        sku: values.sku,
        name: values.name,
        description: values.description,
        categoryId: values.categoryId,
        unitOfMeasureId: values.unitOfMeasureId,
        price: values.price,
        standardCost: values.standardCost,
        barcode: values.barcode,
        minStockAlert: values.minStockAlert,
        maxStock: values.maxStock,
        isVariableWeight: values.isVariableWeight || false,
        trackInventory: values.trackInventory !== false,
        trackLots: values.trackLots || false,
        trackExpiry: values.trackExpiry || false,
        requiresRefrigeration: values.requiresRefrigeration || false,
        minTemperature: values.minTemperature,
        maxTemperature: values.maxTemperature,
      };

      if (product) {
        await productsApi.updateProduct(product.id, dto);
        message.success('Producto actualizado');
      } else {
        await productsApi.createProduct(dto);
        message.success('Producto creado');
      }
      onSuccess();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title={product ? 'Editar Producto' : 'Nuevo Producto'}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      className="product-form-modal"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="SKU"
              name="sku"
              rules={[{ required: true, message: 'Ingresa el SKU' }]}
            >
              <Input placeholder="P-001" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Código de Barras" name="barcode">
              <Input placeholder="0000000000000" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Nombre"
          name="name"
          rules={[{ required: true, message: 'Ingresa el nombre' }]}
        >
          <Input placeholder="Nombre del producto" />
        </Form.Item>

        <Form.Item label="Descripción" name="description">
          <Input.TextArea rows={3} placeholder="Descripción del producto" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Categoría" name="categoryId">
              <Select placeholder="Selecciona categoría" allowClear>
                {categories.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Unidad de Medida" name="unitOfMeasureId">
              <Select placeholder="Selecciona unidad" allowClear>
                {units.map((unit) => (
                  <Select.Option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.abbreviation})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Precio"
              name="price"
              rules={[{ required: true, message: 'Ingresa el precio' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="0.00"
                prefix="$"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Costo Estándar" name="standardCost">
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="0.00"
                prefix="$"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Stock Mínimo" name="minStockAlert">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Stock Máximo" name="maxStock">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Peso Variable" name="isVariableWeight" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Controlar Inventario"
              name="trackInventory"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Controlar Lotes" name="trackLots" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Controlar Caducidad" name="trackExpiry" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Requiere Refrigeración"
          name="requiresRefrigeration"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.requiresRefrigeration !== curr.requiresRefrigeration}>
          {({ getFieldValue }) =>
            getFieldValue('requiresRefrigeration') ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Temperatura Mínima (°C)" name="minTemperature">
                    <InputNumber style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Temperatura Máxima (°C)" name="maxTemperature">
                    <InputNumber style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
              </Row>
            ) : null
          }
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancelar
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {product ? 'Actualizar' : 'Crear'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
