import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Popconfirm,
  message,
  Typography,
  Select,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { productsApi } from '../../api/products.api';
import type { Product, ProductCategory } from '../../types/product.types';
import { useDebounce } from '../../hooks/useDebounce';
import ProductForm from './ProductForm';
import ProductDetail from './ProductDetail';
import './Products.css';

const { Title } = Typography;

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, debouncedSearch, categoryFilter]);

  async function loadProducts() {
    try {
      setLoading(true);
      const response = await productsApi.getProducts({
        page,
        limit,
        search: debouncedSearch || undefined,
        categoryId: categoryFilter,
        isActive: true,
      });
      setProducts(response.data);
      setTotal(response.total);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await productsApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async function handleDelete(id: number) {
    try {
      await productsApi.deleteProduct(id);
      message.success('Producto eliminado');
      loadProducts();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al eliminar producto');
    }
  }

  function handleEdit(product: Product) {
    setSelectedProduct(product);
    setFormVisible(true);
  }

  function handleView(product: Product) {
    setSelectedProduct(product);
    setDetailVisible(true);
  }

  function handleCreate() {
    setSelectedProduct(null);
    setFormVisible(true);
  }

  function handleFormSuccess() {
    setFormVisible(false);
    setSelectedProduct(null);
    loadProducts();
  }

  const columns: ColumnsType<Product> = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Categoría',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 150,
      render: (name) => name || '-',
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right',
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
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
            title="¿Eliminar producto?"
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
          Productos
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Nuevo Producto
        </Button>
      </div>

      <div className="products-filters">
        <Input
          placeholder="Buscar por nombre o SKU..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          className="products-search"
        />
        <Select
          placeholder="Todas las categorías"
          value={categoryFilter}
          onChange={setCategoryFilter}
          allowClear
          style={{ minWidth: 200 }}
        >
          {categories.map((cat) => (
            <Select.Option key={cat.id} value={cat.id}>
              {cat.name}
            </Select.Option>
          ))}
        </Select>
        <Button icon={<ReloadOutlined />} onClick={loadProducts}>
          Actualizar
        </Button>
      </div>

      <Table
        className="products-table"
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          onChange: setPage,
          showSizeChanger: false,
          showTotal: (total) => `Total: ${total} productos`,
        }}
        scroll={{ x: 1000 }}
      />

      {formVisible && (
        <ProductForm
          open={formVisible}
          product={selectedProduct}
          onCancel={() => {
            setFormVisible(false);
            setSelectedProduct(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {detailVisible && selectedProduct && (
        <ProductDetail
          open={detailVisible}
          product={selectedProduct}
          onClose={() => {
            setDetailVisible(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
