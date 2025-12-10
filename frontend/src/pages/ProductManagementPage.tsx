import { useEffect, useState } from 'react';
import { Table, Switch, Button, Space, message, Spin, Tag, Input } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import './ProductManagementPage.css';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: string;
  isActive: boolean;
  showInPos: boolean;
}

const ProductManagementPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  const API_BASE = 'http://localhost:3000/api';

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/products`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 1000 },
      });

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setProducts(data);
    } catch (error) {
      message.error('Error al cargar productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleTogglePosVisibility = async (productId: number, currentValue: boolean) => {
    try {
      setUpdating(productId);
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE}/products/${productId}/toggle-pos-visibility`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProducts(prev =>
        prev.map(p =>
          p.id === productId
            ? { ...p, showInPos: !p.showInPos }
            : p
        )
      );
      
      message.success(
        `Producto ${!currentValue ? 'habilitado' : 'deshabilitado'} en el POS`
      );
    } catch (error) {
      message.error('Error al actualizar producto');
      console.error(error);
    } finally {
      setUpdating(null);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 150,
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: string) => `$${Number(price).toFixed(2)}`,
    },
    {
      title: 'Activo',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Sí' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Mostrar en POS',
      dataIndex: 'showInPos',
      key: 'showInPos',
      width: 150,
      render: (showInPos: boolean, record: Product) => (
        <Switch
          checked={showInPos}
          onChange={() => handleTogglePosVisibility(record.id, showInPos)}
          loading={updating === record.id}
          disabled={!record.isActive}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>Gestión de Productos</h1>
        <Space>
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchProducts}
            loading={loading}
          >
            Recargar
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredProducts.map(p => ({ ...p, key: p.id }))}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        loading={loading}
      />

      <div style={{ marginTop: '24px', padding: '12px', backgroundColor: '#f0f2f5', borderRadius: '4px' }}>
        <p>
          <strong>Nota:</strong> Solo los productos activos y habilitados para POS
          aparecerán en el sistema de punto de venta.
        </p>
      </div>
    </div>
  );
};

export default ProductManagementPage;
