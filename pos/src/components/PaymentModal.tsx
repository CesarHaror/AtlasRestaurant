import { useState } from 'react';
import { Drawer, Radio, Button, Space, InputNumber, message, Card, Row, Col, Statistic, Divider } from 'antd';
import { CreditCardOutlined, DollarOutlined, BankOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { PaymentMethod as IPaymentMethod } from '../types';
import './PaymentModal.css';

interface PaymentModalProps {
  visible: boolean;
  total: number;
  onPaymentSuccess: (payments: IPaymentMethod[]) => void;
  onCancel: () => void;
  loading?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  total,
  onPaymentSuccess,
  onCancel,
  loading = false,
}) => {
  const [payments, setPayments] = useState<IPaymentMethod[]>([
    { method: 'cash', amount: total },
  ]);

  const handleAddPaymentMethod = () => {
    const currentPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingLocal = Math.max(0, total - currentPaid);
    setPayments([...payments, { method: 'cash', amount: Math.max(0.01, Number(remainingLocal.toFixed(2))) }]);
  };

  const handleRemovePaymentMethod = (index: number) => {
    if (payments.length > 1) {
      setPayments(payments.filter((_, i) => i !== index));
    }
  };

  const handlePaymentChange = (index: number, method: IPaymentMethod) => {
    const newPayments = [...payments];
    newPayments[index] = method;
    setPayments(newPayments);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCardOutlined />;
      case 'transfer':
        return <BankOutlined />;
      case 'credit':
        return <CreditCardOutlined />;
      default:
        return <DollarOutlined />;
    }
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, total - totalPaid);
  const change = Math.max(0, totalPaid - total);

  const handleSubmit = () => {
    if (totalPaid < total) {
      message.error(`Falta pagar $${remaining.toFixed(2)}`);
      return;
    }

    if (change > 0) {
      message.success(`Cambio: $${change.toFixed(2)}`);
    }

    onPaymentSuccess(payments);
    setPayments([{ method: 'cash', amount: total }]);
  };

  return (
    <Drawer
      title="Procesar Pago"
      placement="right"
      onClose={onCancel}
      open={visible}
      width={500}
      className="payment-modal-drawer"
      footer={
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={onCancel} style={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            style={{ flex: 1 }}
            size="large"
          >
            Confirmar Pago
          </Button>
        </div>
      }
    >
      <div className="payment-content">
        {/* Total Summary Card */}
        <Card className="payment-summary" type="inner">
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Total"
                value={total}
                prefix="$"
                precision={2}
                styles={{ content: { color: '#1890ff', fontSize: '24px' } }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Pagado"
                value={totalPaid}
                prefix="$"
                precision={2}
                styles={{ content: { color: totalPaid >= total ? '#52c41a' : '#ff4d4f', fontSize: '24px' } }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={totalPaid >= total ? 'Cambio' : 'Falta'}
                value={totalPaid >= total ? change : remaining}
                prefix="$"
                precision={2}
                styles={{ content: { color: totalPaid >= total ? '#faad14' : '#ff4d4f', fontSize: '20px' } }}
              />
            </Col>
          </Row>
        </Card>

        <Divider />

        {/* Payment Methods */}
        <div className="payment-methods">
          <h3 style={{ marginBottom: '16px' }}>Métodos de Pago</h3>
          {payments.map((payment, index) => (
            <Card key={index} className="payment-method-card" size="small">
              <Space orientation="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getPaymentIcon(payment.method)}
                  <span style={{ fontWeight: 600 }}>Método {index + 1}</span>
                </div>

                <div style={{ width: '100%' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#666' }}>
                    Tipo de Pago
                  </label>
                  <Radio.Group
                    value={payment.method}
                    onChange={(e) =>
                      handlePaymentChange(index, { ...payment, method: e.target.value })
                    }
                    style={{ width: '100%' }}
                  >
                    <Space orientation="vertical" style={{ width: '100%' }}>
                      <Radio value="cash">
                        <DollarOutlined /> Efectivo
                      </Radio>
                      <Radio value="card">
                        <CreditCardOutlined /> Tarjeta
                      </Radio>
                      <Radio value="transfer">
                        <BankOutlined /> Transferencia
                      </Radio>
                      <Radio value="credit">
                        <CreditCardOutlined /> Crédito
                      </Radio>
                    </Space>
                  </Radio.Group>
                </div>

                <div style={{ width: '100%' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#666' }}>
                    Monto
                  </label>
                  <InputNumber
                    min={0.01}
                    step={0.01}
                    value={payment.amount}
                    onChange={(value) =>
                      handlePaymentChange(index, { ...payment, amount: typeof value === 'number' ? value : 0.01 })
                    }
                    precision={2}
                    prefix="$"
                    style={{ width: '100%' }}
                    size="large"
                  />
                </div>

                {payments.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemovePaymentMethod(index)}
                    block
                  >
                    Eliminar Método
                  </Button>
                )}
              </Space>
            </Card>
          ))}

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddPaymentMethod}
            block
            style={{ marginTop: '16px' }}
          >
            Agregar Método de Pago
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default PaymentModal;
