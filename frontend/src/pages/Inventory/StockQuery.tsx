import { useState, useEffect } from 'react';
import { Table, Card, Select, Input, Button, Tag, Space, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getCurrentStock, getStockByProduct, getStockByWarehouse } from '../../services/inventoryApi';
import { getProducts } from '../../services/productApi';
import { getWarehouses } from '../../services/inventoryApi';
import type { StockInfo, Product, Warehouse, LotStatus } from '../../types/inventory';
import './Inventory.css';

const { Option } = Select;

export default function StockQuery() {
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<StockInfo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>();
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadFilters();
    loadStock();
  }, []);

  const loadFilters = async () => {
    try {
      const [productsData, warehousesData] = await Promise.all([
        getProducts(),
        getWarehouses()
      ]);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);
    } catch (error) {
      message.error('Error al cargar filtros');
    }
  };

  const loadStock = async () => {
    setLoading(true);
    try {
      const data = await getCurrentStock();
      setStockData(data);
    } catch (error) {
      message.error('Error al cargar stock');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      let data: StockInfo[];
      
      if (selectedProduct && selectedWarehouse) {
        // Buscar por producto y almacén específicos
        const productStock = await getStockByProduct(selectedProduct);
        data = (productStock || []).filter((s: StockInfo) => String((s as any).warehouseId) === String(selectedWarehouse));
      } else if (selectedProduct) {
        data = await getStockByProduct(selectedProduct);
      } else if (selectedWarehouse) {
        data = await getStockByWarehouse(selectedWarehouse);
      } else {
        data = await getCurrentStock();
      }
      
      setStockData(data);
    } catch (error) {
      message.error('Error al buscar stock');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedProduct(undefined);
    setSelectedWarehouse(undefined);
    setSearchText('');
    loadStock();
  };

  const getStatusColor = (status: LotStatus): string => {
    const colors: Record<LotStatus, string> = {
      AVAILABLE: 'success',
      RESERVED: 'warning',
      SOLD_OUT: 'default',
      EXPIRED: 'error',
      DAMAGED: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: LotStatus): string => {
    const texts: Record<LotStatus, string> = {
      AVAILABLE: 'Disponible',
      RESERVED: 'Reservado',
      SOLD_OUT: 'Agotado',
      EXPIRED: 'Expirado',
      DAMAGED: 'Dañado',
    };
    return texts[status] || status;
  };

  const filteredData = stockData.filter(item => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      (item.product?.name || '').toLowerCase().includes(search) ||
      (item.product?.sku || '').toLowerCase().includes(search) ||
      (item.warehouse?.name || '').toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      title: 'Producto',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (_: any, record: StockInfo) => (
        <div>
          <div>{record.product?.name || '-'}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.product?.sku || ''}</div>
        </div>
      ),
    },
    {
      title: 'Almacén',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
      render: (_: any, record: StockInfo) => (
        <div>
          <div>{record.warehouse?.name || '-'}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.warehouse?.code || ''}</div>
        </div>
      ),
    },
    {
      title: 'Cantidad',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      align: 'right' as const,
      render: (quantity: number, record: StockInfo) => (
        <span style={{ fontWeight: 'bold' }}>
          {Number(quantity).toFixed(2)} {record.product?.unit || ''}
        </span>
      ),
    },
    {
      title: 'Lotes',
      dataIndex: 'lotCount',
      key: 'lotCount',
      align: 'center' as const,
    },
    {
      title: 'Valor Total',
      dataIndex: 'totalValue',
      key: 'totalValue',
      align: 'right' as const,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: 'Próximo Vencimiento',
      dataIndex: 'earliestExpiry',
      key: 'earliestExpiry',
      render: (date: string | null) => {
        if (!date) return '-';
        const expiryDate = new Date(date);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let color = 'default';
        if (daysUntilExpiry < 0) color = 'error';
        else if (daysUntilExpiry <= 7) color = 'error';
        else if (daysUntilExpiry <= 30) color = 'warning';
        
        return (
          <Tag color={color}>
            {expiryDate.toLocaleDateString()} ({daysUntilExpiry} días)
          </Tag>
        );
      },
    },
    {
      title: 'Estado',
      dataIndex: ['lots', 0, 'status'],
      key: 'status',
      render: (_: any, record: StockInfo) => {
        if (!record.lots || record.lots.length === 0) return '-';
        return record.lots.map((lot, idx) => (
          <Tag key={idx} color={getStatusColor(lot.status)}>
            {getStatusText(lot.status)}
          </Tag>
        ));
      },
    },
  ];

  return (
    <div className="inventory-page">
        <Card 
          title="Consulta de Stock"
          extra={
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadStock}
              loading={loading}
            >
              Actualizar
            </Button>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Space wrap>
              <Select
                style={{ width: 200 }}
                placeholder="Filtrar por producto"
                allowClear
                showSearch
                value={selectedProduct}
                onChange={setSelectedProduct}
                filterOption={(input: string, option: any) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={(products || []).map(p => ({
                  value: p.id,
                  label: `${p.name} (${p.sku})`
                }))}
              />
              <Select
                style={{ width: 200 }}
                placeholder="Filtrar por almacén"
                allowClear
                value={selectedWarehouse}
                onChange={setSelectedWarehouse}
              >
                {warehouses.map(w => (
                  <Option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </Option>
                ))}
              </Select>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                Buscar
              </Button>
              <Button onClick={handleReset}>
                Limpiar
              </Button>
            </Space>

            <Input
              placeholder="Buscar por nombre, SKU o almacén..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />

            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey={(record: StockInfo) => `${String((record as any).productId ?? record.product?.id ?? 'p')}-${String((record as any).warehouseId ?? record.warehouse?.id ?? 'all')}`}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total: number) => `Total: ${total} registros`,
              }}
            />
          </Space>
        </Card>
      </div>
  );
}
