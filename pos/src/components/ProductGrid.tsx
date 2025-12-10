import { useEffect, useState } from 'react';
import { Card, Row, Col, Spin, Empty, Badge, Image, Input } from 'antd';
import { ShoppingCartOutlined, SearchOutlined } from '@ant-design/icons';
import type { Product } from '../types';
import { productService } from '../services/api';
import { useCartStore } from '../stores/cartStore';
import './ProductGrid.css';

interface ProductGridProps {
  selectedCategoryId: number | null;
}

const ProductGrid: React.FC<ProductGridProps> = ({ selectedCategoryId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAll();
        // La respuesta viene como { data: [...] }
        const productsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any)?.data || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts(searchTerm);
  }, [selectedCategoryId, searchTerm, products]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const filterProducts = (search: string) => {
    let filtered = products.filter(product => 
      (product.name.toLowerCase().includes(search.toLowerCase()) ||
       product.sku.toLowerCase().includes(search.toLowerCase()))
    );
    if (selectedCategoryId !== null) {
      filtered = filtered.filter(p => p.categoryId === selectedCategoryId);
    }
    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: Product) => {
    const price = Number(product.price);
    addItem({
      productId: String(product.id), // Convertir a string para UUID
      name: product.name,
      price,
      quantity: 1,
      subtotal: price,
      thumbnailUrl: product.thumbnailUrl,
      imageUrl: product.imageUrl,
    });
  };

  if (loading) return <Spin />;
  if (products.length === 0) return <Empty description="No hay productos disponibles" />;

  return (
    <div className="product-grid">
      <div className="product-search-container">
        <Input
          size="large"
          placeholder="Buscar por nombre o SKU..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          style={{ marginBottom: 0 }}
        />
      </div>
      {filteredProducts.length === 0 ? (
        <Empty 
          description={searchTerm ? "No se encontraron productos" : "No hay productos disponibles"}
          style={{ marginTop: 48 }}
        />
      ) : (
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        {filteredProducts.map((product) => (
          <Col key={product.id} xs={24} sm={12} md={6} lg={5}>
            <Card
              hoverable
              className="product-card"
              onClick={() => handleAddToCart(product)}
              styles={{ body: { padding: '6px 12px 6px 12px' } }}
              cover={
                product.thumbnailUrl ? (
                  <Image
                    src={product.thumbnailUrl}
                    alt={product.name}
                    style={{ height: 120, objectFit: 'cover' }}
                    preview={false}
                  />
                ) : (
                  <div className="product-placeholder">
                    <ShoppingCartOutlined style={{ fontSize: 40, color: '#1890ff' }} />
                  </div>
                )
              }
            >
              <h4 className="product-name">{product.name}</h4>
              <p className="product-sku">SKU: {product.sku}</p>
              <div className="product-footer">
                <span className="product-price">${Number(product.price).toFixed(2)}</span>
              </div>
              {product.quantity <= 5 && product.quantity > 0 && (
                <Badge status="warning" text={`Stock: ${product.quantity}`} />
              )}
              {product.quantity === 0 && (
                <Badge status="error" text="Agotado" />
              )}
            </Card>
          </Col>
        ))}
      </Row>
      )}
    </div>
  );
};

export default ProductGrid;
