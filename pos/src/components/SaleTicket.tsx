import React, { useRef } from 'react';
import { Button, Space, Card, Row, Col, Divider, message } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { PaymentMethod } from '../types';
import './SaleTicket.css';

interface SaleItem {
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface SaleTicketProps {
  items: SaleItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  payments: PaymentMethod[];
  saleNumber: string;
  cashRegisterCode?: string;
  branchName?: string;
  userName?: string;
  companyName?: string;
  timestamp?: string;
}

const SaleTicket: React.FC<SaleTicketProps> = ({
  items,
  subtotal,
  taxAmount,
  total,
  payments,
  saleNumber,
  cashRegisterCode = 'Caja 1',
  branchName = 'Sucursal Principal',
  userName = 'Usuario',
  companyName = 'AtlasERP',
  timestamp = new Date().toLocaleString('es-MX'),
}) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  const paymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta de Crédito',
      transfer: 'Transferencia',
      credit: 'Crédito',
    };
    return labels[method] || method;
  };

  const handlePrint = () => {
    if (ticketRef.current) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(ticketRef.current.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;

    try {
      message.loading({ content: 'Generando PDF...', key: 'pdf-download' });

      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      pdf.save(`Ticket-${saleNumber}.pdf`);
      message.success({ content: 'PDF descargado exitosamente', key: 'pdf-download' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error({ content: 'Error al generar PDF', key: 'pdf-download' });
    }
  };

  return (
    <div className="sale-ticket-container">
      <Card className="ticket-controls">
        <Space>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            Imprimir
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadPDF}
          >
            Descargar PDF
          </Button>
        </Space>
      </Card>

      <div ref={ticketRef} className="sale-ticket">
        {/* Header */}
        <div className="ticket-header">
          <h1 className="company-name">{companyName}</h1>
          <p className="branch-name">{branchName}</p>
          <Divider style={{ margin: '8px 0' }} />
        </div>

        {/* Sale Info */}
        <div className="ticket-info">
          <Row justify="space-between">
            <Col>
              <p><strong>Ticket:</strong> {saleNumber}</p>
            </Col>
            <Col>
              <p><strong>Caja:</strong> {cashRegisterCode}</p>
            </Col>
          </Row>
          <Row justify="space-between">
            <Col>
              <p><strong>Vendedor:</strong> {userName}</p>
            </Col>
            <Col>
              <p><strong>Hora:</strong> {timestamp}</p>
            </Col>
          </Row>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Items */}
        <div className="ticket-items">
          <div className="items-header">
            <div className="item-col item-description">PRODUCTO</div>
            <div className="item-col item-qty">CANT</div>
            <div className="item-col item-price">P.UNIT</div>
            <div className="item-col item-total">TOTAL</div>
          </div>
          <Divider style={{ margin: '4px 0' }} />

          {items.map((item, index) => (
            <div key={index} className="item-row">
              <div className="item-col item-description">{item.productName}</div>
              <div className="item-col item-qty">{item.quantity}</div>
              <div className="item-col item-price">${item.price.toFixed(2)}</div>
              <div className="item-col item-total">${item.total.toFixed(2)}</div>
            </div>
          ))}
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Totals */}
        <div className="ticket-totals">
          <Row justify="space-between" className="total-row">
            <Col>Subtotal:</Col>
            <Col><strong>${subtotal.toFixed(2)}</strong></Col>
          </Row>
          <Row justify="space-between" className="total-row">
            <Col>Impuesto (IVA):</Col>
            <Col><strong>${taxAmount.toFixed(2)}</strong></Col>
          </Row>
          <Divider style={{ margin: '8px 0' }} />
          <Row justify="space-between" className="grand-total">
            <Col><strong>TOTAL:</strong></Col>
            <Col><strong className="total-amount">${total.toFixed(2)}</strong></Col>
          </Row>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Payments */}
        <div className="ticket-payments">
          <h4>FORMAS DE PAGO:</h4>
          {payments.map((payment, index) => (
            <Row key={index} justify="space-between" className="payment-row">
              <Col>{paymentMethodLabel(payment.method)}</Col>
              <Col>${payment.amount.toFixed(2)}</Col>
            </Row>
          ))}
        </div>

        {/* Footer */}
        <div className="ticket-footer">
          <Divider style={{ margin: '12px 0' }} />
          <p className="footer-text">Gracias por su compra</p>
          <p className="footer-text">Conserve su ticket para garantía</p>
          <p className="footer-text ticket-number">Ticket: {saleNumber}</p>
          <p className="footer-text" style={{ fontSize: '10px', marginTop: '8px' }}>
            {new Date().toLocaleString('es-MX')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SaleTicket;
