import MainLayout from '../../layouts/MainLayout/MainLayout';
import { Row, Col, Card, Statistic } from 'antd';

export default function DashboardPage() {
  return (
    <MainLayout>
      <Row gutter={[16,16]}>
        <Col xs={24} md={8}>
          <Card><Statistic title="Ventas Hoy" value={0} prefix="$" /></Card>
        </Col>
        <Col xs={24} md={8}>
          <Card><Statistic title="Clientes" value={0} /></Card>
        </Col>
        <Col xs={24} md={8}>
          <Card><Statistic title="Inventario Bajo" value={0} /></Card>
        </Col>
      </Row>
    </MainLayout>
  );
}
