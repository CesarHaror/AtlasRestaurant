import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Popconfirm,
  message,
  Typography,
  Modal,
  Form,
  Upload,
  Image,
  Descriptions,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { RcFile, UploadFile } from 'antd/es/upload';
import { menuApi } from '../../api/menu.api';
import type { ProductCategory, CreateCategoryDto } from '../../types/menu.types';
import { useDebounce } from '../../hooks/useDebounce';
import './Products.css';

const { Title } = Typography;
const { TextArea } = Input;

interface CategoriesListState {
  data: MenuItemCategory[];
  loading: boolean;
  pagination: TablePaginationConfig;
  searchText: string;
}

export default function CategoriesList() {
  const [state, setState] = useState<CategoriesListState>({
    data: [],
    loading: false,
    pagination: { current: 1, pageSize: 10, total: 0 },
    searchText: '',
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<ProductCategory | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<UploadFile | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<UploadFile | null>(null);
  const debouncedSearch = useDebounce(state.searchText, 500);

  // Load categories
  useEffect(() => {
    fetchCategories();
  }, [state.pagination.current, state.pagination.pageSize, debouncedSearch]);

  const fetchCategories = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const response = await menuApi.getCategories();
      console.log('Categorías cargadas:', response);
      const filtered = (response || []).filter(
        (cat) =>
          !debouncedSearch ||
          cat.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          cat.code?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setState((prev) => ({
        ...prev,
        data: filtered,
        pagination: { ...prev.pagination, total: filtered.length },
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Error al cargar categorías');
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleAddCategory = () => {
    setEditingId(null);
    form.resetFields();
    setImageFile(null);
    setThumbnailFile(null);
    setIsModalVisible(true);
  };

  const handleView = (category: MenuItemCategory) => {
    setViewingCategory(category);
    setViewDrawerVisible(true);
  };

  const handleEdit = (category: MenuItemCategory) => {
    setEditingId(category.id);
    form.setFieldsValue({
      code: category.code,
      name: category.name,
      description: category.description,
      displayOrder: category.displayOrder,
    });
    setImageFile(null);
    setThumbnailFile(null);
    setIsModalVisible(true);
  };

  const handleSave = async (values: CreateCategoryDto) => {
    try {
      console.log('handleSave called with values:', values);
      console.log('imageFile:', imageFile);
      console.log('thumbnailFile:', thumbnailFile);

      // Convertir archivos a base64 comprimido
      let imageUrl: string | undefined;
      let thumbnailUrl: string | undefined;

      // Si hay un nuevo archivo de imagen, comprimirlo y convertirlo a base64
      if (imageFile?.originFileObj) {
        console.log('Compressing imageFile...');
        imageUrl = await compressImage(imageFile.originFileObj, 0.6, 400);
        console.log('imageUrl compressed, length:', imageUrl?.length);
      }

      // Si hay un nuevo archivo de miniatura, comprimirlo y convertirlo a base64
      if (thumbnailFile?.originFileObj) {
        console.log('Compressing thumbnailFile...');
        thumbnailUrl = await compressImage(thumbnailFile.originFileObj, 0.5, 200);
        console.log('thumbnailUrl compressed, length:', thumbnailUrl?.length);
      }

      // Construir el payload solo con los campos necesarios
      const payload: any = {
        code: values.code,
        name: values.name,
        description: values.description,
        displayOrder: values.displayOrder,
      };

      // Solo agregar imagenes si se han actualizado
      if (imageUrl) {
        payload.imageUrl = imageUrl;
        console.log('Adding imageUrl to payload');
      }
      if (thumbnailUrl) {
        payload.thumbnailUrl = thumbnailUrl;
        console.log('Adding thumbnailUrl to payload');
      }

      console.log('Final payload size:', JSON.stringify(payload).length, 'bytes');

      if (editingId) {
        console.log(`Updating category ${editingId}`);
        await menuApi.updateCategory(editingId, payload);
        message.success('Categoría actualizada correctamente');
      } else {
        console.log('Creating new category');
        await menuApi.createCategory(payload);
        message.success('Categoría creada correctamente');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingId(null);
      setImageFile(null);
      setThumbnailFile(null);
      
      // Recargar categorías después de un pequeño delay para asegurar que la BD se actualice
      setTimeout(() => {
        console.log('Reloading categories...');
        fetchCategories();
      }, 500);
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      message.error('Error al guardar categoría');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await menuApi.deleteCategory(id);
      message.success('Categoría eliminada correctamente');
      fetchCategories();
    } catch (error) {
      message.error('Error al eliminar categoría');
    }
  };

  // Comprimir imagen usando Canvas
  const compressImage = (file: RcFile, quality: number = 0.6, maxWidth: number = 400): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new (window as any).Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Reducir tamaño si es muy grande
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convertir a base64 con compresión
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = reject;
    });
  };

  const onImageChange = (info: any) => {
    console.log('Image onChange:', info);
    if (info.fileList && info.fileList.length > 0) {
      setImageFile(info.fileList[0]);
    }
  };

  const onThumbnailChange = (info: any) => {
    console.log('Thumbnail onChange:', info);
    if (info.fileList && info.fileList.length > 0) {
      setThumbnailFile(info.fileList[0]);
    }
  };

  const columns: ColumnsType<MenuCategory> = [
    {
      title: 'Foto',
      dataIndex: 'thumbnailUrl',
      key: 'thumbnail',
      width: 100,
      render: (thumbnailUrl) => {
        if (!thumbnailUrl) return '-';
        // Construir URL absoluta para las imágenes
        const baseUrl = 'http://localhost:3000';
        const imageUrl = thumbnailUrl.startsWith('http') 
          ? thumbnailUrl 
          : thumbnailUrl.startsWith('/')
            ? `${baseUrl}${thumbnailUrl}`
            : `${baseUrl}/${thumbnailUrl}`;
        
        return (
          <Image
            src={imageUrl}
            alt="Thumbnail"
            width={80}
            height={80}
            preview={true}
            style={{ objectFit: 'cover', borderRadius: '4px' }}
          />
        );
      },
    },
    {
      title: 'Código',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      sorter: (a, b) => (a.code || '').localeCompare(b.code || ''),
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 200,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 250,
      sorter: (a, b) => (a.description || '').localeCompare(b.description || ''),
      render: (description) => {
        if (!description) return '-';
        return description.length > 60 ? `${description.substring(0, 60)}...` : description;
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" className="product-actions">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            size="small"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="¿Eliminar categoría?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleDelete(record.id)}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="products-page">
      <div className="products-header">
        <Title level={2} className="products-title">
          Categorías
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
          Nueva Categoría
        </Button>
      </div>

      <div className="products-filters">
        <Input
          placeholder="Buscar por código o nombre..."
          prefix={<SearchOutlined />}
          value={state.searchText}
          onChange={(e) =>
            setState((prev) => ({ ...prev, searchText: e.target.value }))
          }
          allowClear
          className="products-search"
        />
        <Button icon={<ReloadOutlined />} onClick={fetchCategories} />
      </div>

      <Table
        columns={columns}
        dataSource={state.data}
        loading={state.loading}
        pagination={state.pagination}
        onChange={(pagination) => {
          setState((prev) => ({ ...prev, pagination }));
        }}
        rowKey="id"
      />

      {/* Modal para ver categoría */}
      <Modal
        title="Detalle de Categoría"
        open={viewDrawerVisible}
        onCancel={() => setViewDrawerVisible(false)}
        footer={null}
        width={800}
        className="category-detail-modal"
      >
        {viewingCategory && (
          <>
            {viewingCategory.imageUrl && (
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <Image
                  src={viewingCategory.imageUrl}
                  alt={viewingCategory.name}
                  style={{ maxWidth: 200, maxHeight: 200, objectFit: 'contain' }}
                />
              </div>
            )}

            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Código" span={1}>
                {viewingCategory.code}
              </Descriptions.Item>
              <Descriptions.Item label="Orden" span={1}>
                {viewingCategory.displayOrder || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Nombre" span={2}>
                {viewingCategory.name}
              </Descriptions.Item>
              <Descriptions.Item label="Descripción" span={2}>
                {viewingCategory.description || '-'}
              </Descriptions.Item>
            </Descriptions>

            {viewingCategory.thumbnailUrl && (
              <>
                <Divider>Miniatura</Divider>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  {(() => {
                    const baseUrl = 'http://localhost:3000';
                    const imageUrl = viewingCategory.thumbnailUrl.startsWith('http')
                      ? viewingCategory.thumbnailUrl
                      : viewingCategory.thumbnailUrl.startsWith('/')
                        ? `${baseUrl}${viewingCategory.thumbnailUrl}`
                        : `${baseUrl}/${viewingCategory.thumbnailUrl}`;
                    
                    return (
                      <Image
                        src={imageUrl}
                        alt={`${viewingCategory.name} thumbnail`}
                        style={{ maxWidth: 150, maxHeight: 150, objectFit: 'contain' }}
                        preview={true}
                      />
                    );
                  })()}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  handleEdit(viewingCategory);
                  setViewDrawerVisible(false);
                }}
              >
                Editar
              </Button>
              <Popconfirm
                title="¿Eliminar categoría?"
                description="Esta acción no se puede deshacer"
                onConfirm={() => {
                  handleDelete(viewingCategory.id);
                  setViewDrawerVisible(false);
                }}
                okText="Eliminar"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
              >
                <Button danger>Eliminar</Button>
              </Popconfirm>
            </div>
          </>
        )}
      </Modal>

      {/* Modal para crear/editar categoría */}
      <Modal
        title={editingId ? 'Editar Categoría' : 'Nueva Categoría'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
        okText={editingId ? 'Guardar Cambios' : 'Crear'}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="code"
              label="Código"
              rules={[{ required: true, message: 'El código es requerido' }]}
            >
              <Input placeholder="Ej: CARNES, BEBIDAS, etc" />
            </Form.Item>

            <Form.Item
              name="displayOrder"
              label="Orden de Visualización"
              rules={[{ pattern: /^\d+$/, message: 'Debe ser un número' }]}
            >
              <Input type="number" placeholder="Ej: 1, 2, 3..." />
            </Form.Item>
          </div>

          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'El nombre es requerido' }]}
          >
            <Input placeholder="Nombre de la categoría" />
          </Form.Item>

          <Form.Item name="description" label="Descripción">
            <TextArea rows={3} placeholder="Descripción de la categoría" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item label="Foto Principal">
              <Upload
                accept="image/*"
                maxCount={1}
                listType="picture-card"
                fileList={imageFile ? [imageFile] : []}
                onChange={onImageChange}
                beforeUpload={() => false}
              >
                <Button type="dashed" block>Subir Foto</Button>
              </Upload>
            </Form.Item>

            <Form.Item label="Miniatura">
              <Upload
                accept="image/*"
                maxCount={1}
                listType="picture-card"
                fileList={thumbnailFile ? [thumbnailFile] : []}
                onChange={onThumbnailChange}
                beforeUpload={() => false}
              >
                <Button type="dashed" block>Subir Miniatura</Button>
              </Upload>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
