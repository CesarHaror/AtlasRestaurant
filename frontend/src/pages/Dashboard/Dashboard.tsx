import { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Spin,
  message,
  Table,
  Progress,
  Empty,
  Segmented,
  Space,
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  ProductOutlined,
  WarningOutlined,
  UserOutlined,
  TeamOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dashboardApi, DashboardMetrics } from '../../api/dashboard.api';
import './Dashboard.css';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<30 | 60 | 300>(60);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getMetrics();
        setMetrics(data);
      } catch (error) {
        message.error('Error al cargar las métricas del dashboard');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const timer = setInterval(fetchMetrics, refreshInterval * 1000);

    return () => clearInterval(timer);
  }, [refreshInterval]);

  if (loading && !metrics) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!metrics) {
    return <Empty description="No hay datos disponibles" />;
  }

  const profitMargin = metrics.totalRevenue - metrics.totalPurchaseCost;
  const profitPercentage = metrics.totalRevenue > 0 ? (profitMargin / metrics.totalRevenue) * 100 : 0;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <Row gutter={[16, 16]} className="dashboard-header">
        <Col span={24}>
          <Space size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
            <h1 style={{ margin: 0 }}>Dashboard ERP</h1>
            <div>
              <span style={{ marginRight: 16, fontSize: 12, color: '#666' }}>Actualizar cada:</span>
              <Segmented
                value={refreshInterval}
                onChange={(value) => setRefreshInterval(value as 30 | 60 | 300)}
                options={[
                  { label: '30s', value: 30 },
                  { label: '1m', value: 60 },
                  { label: '5m', value: 300 },
                ]}
              />
            </div>
          </Space>
        </Col>
      </Row>

      {/* Key Metrics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card metric-card-primary">
            <Statistic
              title="Ingresos Hoy"
              value={metrics.totalRevenue}
              prefix={<DollarOutlined />}
              suffix=" MXN"
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              {metrics.totalSales} transacciones
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card metric-card-success">
            <Statistic
              title="Ganancia Total"
              value={profitMargin}
              prefix={<ArrowUpOutlined />}
              suffix=" MXN"
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              Margen: {profitPercentage.toFixed(1)}%
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card metric-card-warning">
            <Statistic
              title="Compras Hoy"
              value={metrics.totalPurchases}
              prefix={<ShoppingCartOutlined />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              ${metrics.totalPurchaseCost.toFixed(2)} MXN
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card metric-card-danger">
            <Statistic
              title="Stock Bajo"
              value={metrics.lowStockProducts}
              valueStyle={{ color: '#f5222d' }}
              prefix={<WarningOutlined />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              Total: {metrics.totalProducts} productos
            </div>
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Usuarios Activos"
              value={metrics.activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Empresas"
              value={metrics.totalCompanies}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={12}>
          <Card>
            <Statistic
              title="Productos"
              value={metrics.totalProducts}
              prefix={<ProductOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <Progress
              percent={(metrics.lowStockProducts / metrics.totalProducts) * 100}
              status={metrics.lowStockProducts > metrics.totalProducts * 0.1 ? 'exception' : 'normal'}
              showInfo={false}
              style={{ marginTop: 8 }}
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {metrics.lowStockProducts} bajo stock
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Sales Trend */}
        <Col xs={24} md={12}>
          <Card title="Tendencia de Ventas (Últimos 7 días)" loading={loading}>
            {metrics.salesTrend && metrics.salesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="amount"
                    stroke="#1890ff"
                    name="Monto ($)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="count"
                    stroke="#52c41a"
                    name="Transacciones"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty />
            )}
          </Card>
        </Col>

        {/* Top Products */}
        <Col xs={24} md={12}>
          <Card title="Top 5 Productos" loading={loading}>
            {metrics.topProducts && metrics.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" width={100} />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#1890ff" name="Ingresos ($)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty />
            )}
          </Card>
        </Col>
      </Row>

      {/* Detailed Tables */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Top Products Table */}
        <Col xs={24} md={12}>
          <Card title="Productos Más Vendidos" loading={loading}>
            <Table
              dataSource={metrics.topProducts?.map((p, i) => ({
                key: i,
                name: p.name,
                quantity: p.quantity,
                revenue: p.revenue,
              }))}
              columns={[
                {
                  title: 'Producto',
                  dataIndex: 'name',
                  key: 'name',
                  ellipsis: true,
                },
                {
                  title: 'Cantidad',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  align: 'right' as const,
                },
                {
                  title: 'Ingresos',
                  dataIndex: 'revenue',
                  key: 'revenue',
                  align: 'right' as const,
                  render: (value) => `$${value.toFixed(2)}`,
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Purchases by Supplier */}
        <Col xs={24} md={12}>
          <Card title="Compras por Proveedor" loading={loading}>
            <Table
              dataSource={metrics.purchasesBySupplier?.map((s, i) => ({
                key: i,
                name: s.name,
                count: s.count,
                total: s.total,
              }))}
              columns={[
                {
                  title: 'Proveedor',
                  dataIndex: 'name',
                  key: 'name',
                  ellipsis: true,
                },
                {
                  title: 'OC',
                  dataIndex: 'count',
                  key: 'count',
                  align: 'right' as const,
                },
                {
                  title: 'Total',
                  dataIndex: 'total',
                  key: 'total',
                  align: 'right' as const,
                  render: (value) => `$${value.toFixed(2)}`,
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Resumen del Período" type="inner">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                    ${metrics.totalRevenue.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    Ingresos Totales
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f5222d' }}>
                    ${metrics.totalPurchaseCost.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    Costo de Compras
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                    ${profitMargin.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    Ganancia Neta
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', padding: 16 }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: profitPercentage > 0 ? '#52c41a' : '#f5222d',
                    }}
                  >
                    {profitPercentage.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    Margen de Ganancia
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
