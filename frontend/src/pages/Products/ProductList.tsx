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
  Image,
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
      title: 'Foto',
      dataIndex: 'thumbnailUrl',
      key: 'thumbnail',
      width: 100,
      render: (thumbnailUrl) => (
        thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt="Producto"
            width={80}
            height={80}
            style={{ objectFit: 'cover', borderRadius: '4px' }}
          />
        )
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
      sorter: (a, b) => (a.sku || '').localeCompare(b.sku || ''),
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
      title: 'Categoría',
      key: 'category',
      width: 180,
      sorter: (a, b) => {
        const catA = categories.find((c) => c.id === a.categoryId)?.name || '';
        const catB = categories.find((c) => c.id === b.categoryId)?.name || '';
        return catA.localeCompare(catB);
      },
      render: (_, record) => {
        const cat = categories.find((c) => c.id === record.categoryId);
        return cat?.name || '-';
      },
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right',
      sorter: (a, b) => {
        const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0;
        const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0;
        return priceA - priceB;
      },
      render: (price) => {
        if (price === null || price === undefined || price === '') return '-';
        const num = typeof price === 'number' ? price : parseFloat(price);
        if (isNaN(num)) return '-';
        return `$${num.toFixed(2)}`;
      },
    },
    {
      title: 'Activo en POS',
      dataIndex: 'showInPos',
      key: 'showInPos',
      width: 120,
      sorter: (a, b) => (a.showInPos === b.showInPos ? 0 : a.showInPos ? -1 : 1),
      render: (showInPos) => (
        <Tag color={showInPos ? 'success' : 'default'}>
          {showInPos ? 'Sí' : 'No'}
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
