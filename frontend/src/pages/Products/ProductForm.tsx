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
  Upload,
} from 'antd';
import type { UploadFile, RcFile } from 'antd/es/upload';
import { menuApi } from '../../api/menu.api';
import type {
  Product,
  ProductCategory,
  UnitOfMeasure,
  CreateProductDto,
  UpdateProductDto,
} from '../../types/menu.types';

interface Props {
  open: boolean;
  menuItem: MenuItem | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ open, product, onCancel, onSuccess }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [mainImageList, setMainImageList] = useState<UploadFile[]>([]);
  const [thumbnailImageList, setThumbnailImageList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (open) {
      loadCatalogues();
      if (menuItem) {
        const toNumber = (val: any) => {
          if (val === null || val === undefined || val === '') return undefined;
          const num = typeof val === 'number' ? val : parseFloat(val);
          return isNaN(num) ? undefined : num;
        };
        form.setFieldsValue({
          sku: product.sku,
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          unitOfMeasureId: product.unitOfMeasureId,
          price: toNumber(menuItem.price),
          standardCost: toNumber(menuItem.standardCost),
          barcode: product.barcode,
          minStockAlert: toNumber(menuItem.minStockAlert),
          maxStock: toNumber(menuItem.maxStock),
          isVariableWeight: product.isVariableWeight,
          trackInventory: product.trackInventory,
          trackLots: product.trackLots,
          trackExpiry: product.trackExpiry,
          requiresRefrigeration: product.requiresRefrigeration,
          minTemperature: toNumber(menuItem.minTemperature),
          maxTemperature: toNumber(menuItem.maxTemperature),
          showInPos: product.showInPos,
        });
      } else {
        form.resetFields();
      }
      setMainImageList([]);
      setThumbnailImageList([]);
    }
  }, [open, product]);

  async function loadCatalogues() {
    try {
      const [cats, unts] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getUnitsOfMeasure(),
      ]);
      setCategories(cats);
      setUnits(unts);
    } catch (error) {
      message.error('Error al cargar catálogos');
    }
  }

  const fileToBase64 = (file: RcFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        console.log('Base64 conversion completed, size:', (result.length / 1024).toFixed(2), 'KB');
        resolve(result);
      };
      reader.onerror = (error) => {
        console.error('Error converting file to base64:', error);
        reject(error);
      };
    });
  };

  // Compress image to create thumbnail
  const compressImage = (dataUrl: string, quality: number = 0.5, maxDim: number = 250): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = (height * maxDim) / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = (width * maxDim) / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }
        const compressed = canvas.toDataURL('image/jpeg', quality);
        console.log(`Compressed from ${(dataUrl.length / 1024).toFixed(2)}KB to ${(compressed.length / 1024).toFixed(2)}KB`);
        resolve(compressed);
      };
      img.src = dataUrl;
    });
  };

  const onImageChange = (info: { fileList: UploadFile[] }) => {
    console.log('Main image onChange called, fileList:', info.fileList);
    setMainImageList(info.fileList);
  };

  const onThumbnailChange = (info: { fileList: UploadFile[] }) => {
    console.log('Thumbnail onChange called, fileList:', info.fileList);
    setThumbnailImageList(info.fileList);
  };

  async function handleSubmit(values: any) {
    try {
      setLoading(true);

      // Convertir archivos a base64 y comprimir
      let imageUrl: string | undefined = undefined;
      let thumbnailUrl: string | undefined = undefined;

      console.log('=== FORM SUBMISSION START ===');
      console.log('mainImageList:', mainImageList);
      console.log('thumbnailImageList:', thumbnailImageList);
      console.log('mainImageList length:', mainImageList.length);
      console.log('thumbnailImageList length:', thumbnailImageList.length);

      try {
        // Process main image
        if (mainImageList && mainImageList.length > 0) {
          const mainFile = mainImageList[0];
          console.log('✓ Main image found:', mainFile);
          console.log('  originFileObj:', mainFile.originFileObj);
          
          if (mainFile.originFileObj) {
            console.log('✓ Processing main image file...');
            console.log('  File type:', (mainFile.originFileObj as File).type);
            console.log('  File size:', (mainFile.originFileObj as File).size, 'bytes');
            imageUrl = await fileToBase64(mainFile.originFileObj);
            console.log('✓ Base64 conversion done. Size:', (imageUrl.length / 1024).toFixed(2), 'KB');
            
            // Auto-generate thumbnail from image if not provided separately
            if (!thumbnailImageList || thumbnailImageList.length === 0) {
              console.log('✓ Auto-generating thumbnail from main image...');
              thumbnailUrl = await compressImage(imageUrl);
              console.log('✓ Auto-generated thumbnail size:', (thumbnailUrl.length / 1024).toFixed(2), 'KB');
            }
          } else {
            console.log('✗ Main file has no originFileObj');
          }
        } else {
          console.log('✗ No main image in list');
        }

        // Process separate thumbnail if provided
        if (thumbnailImageList && thumbnailImageList.length > 0) {
          const thumbFile = thumbnailImageList[0];
          console.log('✓ Thumbnail found:', thumbFile);
          
          if (thumbFile.originFileObj) {
            console.log('✓ Processing thumbnail file...');
            console.log('  File type:', (thumbFile.originFileObj as File).type);
            console.log('  File size:', (thumbFile.originFileObj as File).size, 'bytes');
            thumbnailUrl = await fileToBase64(thumbFile.originFileObj);
            // If thumbnail is provided, also compress it
            console.log('✓ Compressing thumbnail...');
            thumbnailUrl = await compressImage(thumbnailUrl);
            console.log('✓ Compressed thumbnail size:', (thumbnailUrl.length / 1024).toFixed(2), 'KB');
          } else {
            console.log('✗ Thumbnail file has no originFileObj');
          }
        } else {
          console.log('✗ No separate thumbnail in list');
        }

        console.log('=== IMAGE PROCESSING COMPLETE ===');
        console.log('Final imageUrl exists:', !!imageUrl);
        console.log('Final imageUrl length:', imageUrl?.length);
        console.log('Final thumbnailUrl exists:', !!thumbnailUrl);
        console.log('Final thumbnailUrl length:', thumbnailUrl?.length);
      } catch (imageError) {
        console.error('Error processing images:', imageError);
        message.error('Error al procesar las imágenes');
        setLoading(false);
        return;
      }

      if (menuItem) {
        const dto: UpdateProductDto = {
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
          showInPos: values.showInPos !== false,
          imageUrl,
          thumbnailUrl,
        };
        console.log('=== SENDING UPDATE DTO ===');
        console.log('Product ID:', product.id);
        console.log('DTO imageUrl exists:', !!dto.imageUrl, 'size:', dto.imageUrl?.length);
        console.log('DTO thumbnailUrl exists:', !!dto.thumbnailUrl, 'size:', dto.thumbnailUrl?.length);
        console.log('Full DTO:', dto);
        await menuApi.updateProduct(menuItem.id, dto);
        message.success('Producto actualizado');
      } else {
        const dto: CreateProductDto = {
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
          showInPos: values.showInPos !== false,
          imageUrl,
          thumbnailUrl,
        };
        console.log('=== SENDING CREATE DTO ===');
        console.log('DTO imageUrl exists:', !!dto.imageUrl, 'size:', dto.imageUrl?.length);
        console.log('DTO thumbnailUrl exists:', !!dto.thumbnailUrl, 'size:', dto.thumbnailUrl?.length);
        console.log('Full DTO:', dto);
        await menuApi.createProduct(dto);
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
      mask={false}
      getContainer={false}
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
            <Form.Item label="Foto Principal">
              <Upload
                accept="image/*"
                maxCount={1}
                listType="picture-card"
                onChange={onImageChange}
                beforeUpload={() => false}
              >
                <Button type="dashed">Seleccionar Foto</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Miniatura">
              <Upload
                accept="image/*"
                maxCount={1}
                listType="picture-card"
                onChange={onThumbnailChange}
                beforeUpload={() => false}
              >
                <Button type="dashed">Seleccionar Miniatura</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

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

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label="Activo en POS"
              name="showInPos"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Requiere Refrigeración"
              name="requiresRefrigeration"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

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
