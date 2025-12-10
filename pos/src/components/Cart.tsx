import { Table, Button, InputNumber, Card, Divider, Statistic, Row, Col, Empty, Space, Image } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { CartItem } from '../types';
import { useCartStore } from '../stores/cartStore';
import './Cart.css';

interface CartProps {
  onCheckout: () => void;
  checkoutLoading?: boolean;
}

const Cart: React.FC<CartProps> = ({ onCheckout, checkoutLoading = false }) => {
  const { items, removeItem, updateQuantity, setDiscount, discountAmount, subtotal, taxAmount, total, clear } =
    useCartStore();

  if (items.length === 0) {
    return (
      <Card className="cart-container">
        <Empty
          description="Carrito vacío"
          style={{ paddingTop: 40, paddingBottom: 40 }}
        />
      </Card>
    );
  }

  const columns = [
    {
      title: 'Foto',
      dataIndex: 'thumbnailUrl',
      key: 'thumbnail',
      width: 80,
      render: (thumbnailUrl: string | undefined) => (
        thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt="Producto"
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: '4px' }}
            preview={false}
          />
        ) : (
          <div style={{ width: 60, height: 60, backgroundColor: '#f0f0f0', borderRadius: '4px' }} />
        )
      ),
    },
    {
      title: 'Producto',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: CartItem) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => updateQuantity(record.productId, value || 1)}
          size="small"
          style={{ width: 70 }}
        />
      ),
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      render: (_: any, record: CartItem) => `$${record.subtotal.toFixed(2)}`,
    },
    {
      title: 'Acción',
      key: 'action',
      render: (_: any, record: CartItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.productId)}
          size="small"
        />
      ),
    },
  ];

  return (
    <Card className="cart-container" title="Carrito de Ventas">
      <Table
        columns={columns}
        dataSource={items.map((item) => ({ ...item, key: item.productId }))}
        pagination={false}
        size="small"
        scroll={{ y: 'calc(100vh - 420px)' }}
        style={{ flex: 1 }}
      />

      <Divider style={{ margin: '6px 0' }} />

      <div className="discount-section">
        <label>Descuento: $</label>
        <InputNumber
          value={discountAmount}
          onChange={(value) => setDiscount(value || 0)}
          min={0}
          precision={2}
          size="small"
          style={{ width: 100 }}
        />
      </div>

      <Divider style={{ margin: '6px 0' }} />

      <Row gutter={8} style={{ marginBottom: 6 }}>
        <Col span={12}>
          <Statistic title="Subtotal" value={subtotal()} prefix="$" precision={2} style={{ fontSize: 12 }} />
        </Col>
        <Col span={12}>
          <Statistic title="Descuento" value={-discountAmount} prefix="$" precision={2} styles={{ content: { color: '#cf1322', fontSize: 12 } }} />
        </Col>
      </Row>

      <Row gutter={8}>
        <Col span={12}>
          <Statistic title="IVA" value={taxAmount()} prefix="$" precision={2} style={{ fontSize: 12 }} />
        </Col>
        <Col span={12}>
          <Statistic
            title="Total"
            value={total()}
            prefix="$"
            precision={2}
            styles={{ content: { fontSize: 16, fontWeight: 'bold', color: '#1890ff' } }}
          />
        </Col>
      </Row>

      <Divider style={{ margin: '6px 0' }} />

      <Space style={{ width: '100%', justifyContent: 'flex-end', gap: '4px' }} size={0}>
        <Button onClick={clear} size="small" style={{ fontSize: 12 }}>Limpiar</Button>
        <Button type="primary" onClick={onCheckout} loading={checkoutLoading} size="small" style={{ fontSize: 12 }}>
          Pagar
        </Button>
      </Space>
    </Card>
  );
};

export default Cart;
