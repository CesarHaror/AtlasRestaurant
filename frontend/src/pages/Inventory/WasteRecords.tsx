import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Modal, message, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getWasteRecords } from '../../services/inventoryApi';
import WasteForm from './WasteForm';
import type { WasteRecord, WasteType } from '../../types/inventory';
import dayjs, { Dayjs } from 'dayjs';
import './Inventory.css';

const { RangePicker } = DatePicker;

export default function WasteRecords() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<WasteRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);

  useEffect(() => {
    loadRecords();
  }, [dateRange]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await getWasteRecords(
        undefined,
        dateRange[0].toISOString(),
        dateRange[1].toISOString()
      );
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Error al cargar registros de desperdicio');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const getTypeColor = (type: WasteType): string => {
    const colors: Record<WasteType, string> = {
      EXPIRY: 'error',
      DAMAGE: 'warning',
      THEFT: 'error',
      TEMPERATURE: 'orange',
      QUALITY: 'gold',
      OTHER: 'default',
    };
    return colors[type] || 'default';
  };

  const getTypeText = (type: WasteType): string => {
    const texts: Record<WasteType, string> = {
      EXPIRY: 'Vencimiento',
      DAMAGE: 'Daño',
      THEFT: 'Robo',
      TEMPERATURE: 'Temperatura',
      QUALITY: 'Calidad',
      OTHER: 'Otro',
    };
    return texts[type] || type;
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'wasteDate',
      key: 'wasteDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Producto',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (_: any, record: WasteRecord) => (
        <div>
          <div>{record.product.name}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.product.sku}</div>
        </div>
      ),
    },
    {
      title: 'Almacén',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
      render: (qty: any, record: WasteRecord) => {
        const num = Number(qty);
        const text = Number.isFinite(num) ? num.toFixed(2) : '-';
        return `${text} ${record.product.unit}`;
      },
    },
    {
      title: 'Costo Total',
      dataIndex: 'totalCost',
      key: 'totalCost',
      align: 'right' as const,
      render: (cost: any) => {
        const num = Number(cost);
        return Number.isFinite(num) ? `$${num.toFixed(2)}` : '-';
      },
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: WasteType) => (
        <Tag color={getTypeColor(type)}>
          {getTypeText(type)}
        </Tag>
      ),
    },
    {
      title: 'Motivo',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: 'Evidencia',
      dataIndex: 'photoUrl',
      key: 'photoUrl',
      render: (url: string | null) => 
        url ? <a href={url} target="_blank" rel="noopener noreferrer">Ver foto</a> : '-',
    },
  ];

  return (
    <div className="inventory-page">
        <Card
          title="Registro de Desperdicios"
          extra={
            <Space>
              <RangePicker
                value={dateRange}
                onChange={(dates: any) => dates && setDateRange(dates as [Dayjs, Dayjs])}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Registrar Desperdicio
              </Button>
            </Space>
          }
        >
          <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
            <Space size="large">
              <div>
                <strong>Total Registros:</strong> {records.reduce((sum, r) => sum + Number(r.quantity || 0), 0).toFixed(2)}
              </div>
              <div>
                <strong>Costo Total:</strong> ${records.reduce((sum, r) => sum + Number(r.totalCost || 0), 0).toFixed(2)}
              </div>
            </Space>
          </Space>

          <Table
            columns={columns}
            dataSource={records}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total: number) => `Total: ${total} registros`,
            }}
          />
        </Card>

        <Modal
          title="Registrar Desperdicio"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={600}
          destroyOnHidden
        >
          <WasteForm
            onSuccess={() => {
              setIsModalOpen(false);
              loadRecords();
            }}
          />
        </Modal>
      </div>
  );
}
