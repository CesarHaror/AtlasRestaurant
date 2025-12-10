import { Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import SaleTicket from './SaleTicket';
import type { PaymentMethod } from '../types';

interface PaymentSuccessProps {
  items: Array<{ productName: string; quantity: number; price: number }>;
  subtotal: number;
  taxAmount: number;
  total: number;
  payments: PaymentMethod[];
  onNewSale: () => void;
  saleNumber?: string;
  cashRegisterCode?: string;
  branchName?: string;
  userName?: string;
  companyName?: string;
}

const PaymentSuccess = ({
  items,
  subtotal,
  taxAmount,
  total,
  payments,
  onNewSale,
  saleNumber = `${Date.now()}`,
  cashRegisterCode = 'Caja 1',
  branchName = 'Sucursal Principal',
  userName = 'Usuario',
  companyName = 'AtlasERP',
}: PaymentSuccessProps) => {
  // Convert items to have total field
  const ticketItems = items.map((item) => ({
    ...item,
    total: item.price * item.quantity,
  }));

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <SaleTicket
        items={ticketItems}
        subtotal={subtotal}
        taxAmount={taxAmount}
        total={total}
        payments={payments}
        saleNumber={saleNumber}
        cashRegisterCode={cashRegisterCode}
        branchName={branchName}
        userName={userName}
        companyName={companyName}
      />

      <div style={{ marginTop: '20px', maxWidth: '600px', margin: '20px auto' }}>
        <Button
          type="primary"
          size="large"
          block
          onClick={onNewSale}
          style={{ height: 50, fontSize: 16 }}
        >
          <HomeOutlined /> Nueva Compra
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
