import React, { useState, useEffect } from 'react';
import { Button, Card, List, Space, Empty, Modal, Row, Col, Statistic, Tag } from 'antd';
import { PlusOutlined, SwapOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSessionStore } from '../stores/sessionStore';
import { useCartStore } from '../stores/cartStore';
import type { CashRegisterSession } from '../types';
import './SessionManager.css';

export const SessionManager: React.FC<{
  onSessionSelect: (sessionId: string) => void;
  onClose: () => void;
  userBranchId?: number;
}> = ({ onSessionSelect, onClose, userBranchId }) => {
  const { sessions, activeSessionId, switchSession, addSession, removeSession } = useSessionStore();
  const { switchToSession, total, items } = useCartStore();
  const [sessionDetails, setSessionDetails] = useState<(CashRegisterSession & { branchName?: string; cashRegisterCode?: string })[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [sessions]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Obtener todas las sesiones de caja del usuario
      const response = await fetch('/api/cash-registers/sessions/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        let data: CashRegisterSession[] = await response.json();
        
        // Para cada sesión, obtener información de la caja y sucursal
        const enriched = await Promise.all(
          data.map(async (sess) => {
            try {
              const cashRegId = (sess as any).cashRegister?.id || (sess as any).cashRegisterId;
              if (!cashRegId) {
                console.warn('No se encontró cashRegisterId para sesión', sess.id);
                return sess;
              }
              const crResp = await fetch(`/api/cash-registers/${cashRegId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
              });
              if (crResp.ok) {
                const cr: any = await crResp.json();
                return {
                  ...sess,
                  cashRegisterCode: cr.code || cr.name || `Caja ${cr.id}`,
                  branchName: cr.branch?.name || cr.branchName || 'Sucursal desconocida',
                  branchId: cr.branchId || cr.branch?.id,
                };
              }
            } catch (e) {
              console.warn('No se pudo cargar caja/sucursal para sesión', sess.id, e);
            }
            return { ...sess };
          })
        );
        
        // Filtrar por branch si userBranchId está especificado
        const filtered = userBranchId 
          ? enriched.filter((sess: any) => sess.branchId === userBranchId)
          : enriched;
        
        setSessionDetails(filtered);

        // Sincronizar sesiones del store con las del backend
        // Solo agregar sesiones nuevas del backend que no estén en el store
        for (const sess of filtered) {
          const existingSession = sessions.find(s => s.id === sess.id);
          if (!existingSession) {
            addSession(sess);
          }
        }
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    switchSession(sessionId);
    switchToSession(sessionId);
    onSessionSelect(sessionId);
    onClose();
  };

  const handleCloseSession = async (sessionId: string) => {
    Modal.confirm({
      title: 'Cerrar Sesión',
      content: '¿Está seguro que desea cerrar esta sesión?',
      okText: 'Sí',
      cancelText: 'No',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await fetch(`/api/cash-registers/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          removeSession(sessionId);
          setSessionDetails(sessionDetails.filter((s) => s.id !== sessionId));
          Modal.success({ title: 'Éxito', content: 'Sesión cerrada exitosamente' });
        } catch (error) {
          console.error('Error closing session:', error);
          Modal.error({ title: 'Error', content: 'Error al cerrar la sesión' });
        }
      },
    });
  };

  return (
    <div className="session-manager">
      <Card
        title="Gestión de Sesiones"
        extra={<Button type="primary" onClick={() => setIsModalVisible(true)} icon={<PlusOutlined />}>Nueva Sesión</Button>}
        bordered={false}
      >
        {sessionDetails.length === 0 ? (
          <Empty description="No hay sesiones disponibles" />
        ) : (
          <List
            dataSource={sessionDetails}
            loading={loading}
            renderItem={(sess) => (
              <List.Item
                className={`session-item ${sess.id === activeSessionId ? 'active' : ''}`}
                extra={
                  <Space>
                    <Tag color={sess.status === 'OPEN' ? 'green' : 'red'}>
                      {sess.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                    </Tag>
                    {sess.status === 'OPEN' && (
                      <>
                        <Button
                          type={sess.id === activeSessionId ? 'primary' : 'default'}
                          icon={<SwapOutlined />}
                          onClick={() => handleSelectSession(sess.id)}
                        >
                          {sess.id === activeSessionId ? 'Activa' : 'Cambiar'}
                        </Button>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleCloseSession(sess.id)}
                        >
                          Cerrar
                        </Button>
                      </>
                    )}
                  </Space>
                }
              >
                <List.Item.Meta
                  title={`${sess.cashRegisterCode} - ${sess.branchName}`}
                  description={`Abierta: ${new Date(sess.createdAt).toLocaleString('es-ES')}`}
                />
              </List.Item>
            )}
          />
        )}

        {activeSessionId && (
          <Card style={{ marginTop: '20px' }} type="inner" title="Sesión Activa">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="Artículos en Carro" value={items.length} suffix="pcs" />
              </Col>
              <Col span={8}>
                <Statistic title="Total Actual" value={total()} prefix="$" precision={2} />
              </Col>
              <Col span={8}>
                <Tag color="blue">ID: {activeSessionId.substring(0, 12)}...</Tag>
              </Col>
            </Row>
          </Card>
        )}
      </Card>

      <Modal
        title="Crear Nueva Sesión"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
      >
        <p>Para crear una nueva sesión, abra una nueva sesión desde la pantalla principal.</p>
      </Modal>
    </div>
  );
};

export default SessionManager;
