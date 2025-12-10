import React from 'react';
import { Modal, Empty, Table, Button, Space, Statistic, Row, Col, Card } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import { useSessionStore } from '../stores/sessionStore';
import type { SessionWithCart } from '../stores/sessionStore';

interface SessionArchiveProps {
  visible: boolean;
  onClose: () => void;
}

export const SessionArchive: React.FC<SessionArchiveProps> = ({ visible, onClose }) => {
  const { getArchivedSessions } = useSessionStore();
  const archivedSessions = getArchivedSessions();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id.substring(0, 8),
      width: 100,
    },
    {
      title: 'Nombre',
      dataIndex: 'customName',
      key: 'customName',
      render: (name: string | undefined, record: SessionWithCart) =>
        name || `Ticket ${record.id.substring(0, 6)}`,
    },
    {
      title: 'Artículos',
      dataIndex: 'items',
      key: 'items',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Transacciones',
      dataIndex: 'history',
      key: 'history',
      width: 100,
      align: 'center' as const,
      render: (history: any[] | undefined) => history?.length || 0,
    },
    {
      title: 'Monto Total',
      dataIndex: 'history',
      key: 'total',
      width: 120,
      align: 'right' as const,
      render: (history: any[] | undefined) => {
        const total = history?.reduce((sum, item) => sum + item.amount, 0) || 0;
        return `$${total.toFixed(2)}`;
      },
    },
    {
      title: 'Hora',
      dataIndex: 'localCreatedAt',
      key: 'time',
      width: 120,
      render: (date: Date | undefined) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      },
    },
  ];

  if (archivedSessions.length === 0) {
    return (
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            Historial de Sesiones
          </Space>
        }
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Cerrar
          </Button>,
        ]}
        width={600}
      >
        <Empty
          description="Sin sesiones archivadas"
          style={{ marginTop: '40px', marginBottom: '40px' }}
        />
      </Modal>
    );
  }

  const totalArchivedAmount = archivedSessions.reduce((sum, session) => {
    const sessionTotal = session.history?.reduce((s, item) => s + item.amount, 0) || 0;
    return sum + sessionTotal;
  }, 0);

  const totalTransactions = archivedSessions.reduce((sum, session) => {
    return sum + (session.history?.length || 0);
  }, 0);

  return (
    <Modal
      title={
        <Space>
          <HistoryOutlined />
          Historial de Sesiones
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Cerrar
        </Button>,
      ]}
      width={900}
    >
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Sesiones Completadas"
              value={archivedSessions.length}
              prefix="📦"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Transacciones Totales"
              value={totalTransactions}
              prefix="💳"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Monto Total"
              value={totalArchivedAmount}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        </Row>
      </Card>

      <Table
        dataSource={archivedSessions}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        size="small"
        scroll={{ x: 800 }}
      />
    </Modal>
  );
};

export default SessionArchive;
