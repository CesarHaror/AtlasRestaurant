import React, { useState } from 'react';
import { Button, Space, Badge, Tag, Tooltip, Empty, Modal, Input, Card, Statistic, Row, Col } from 'antd';
import { PlusOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { useSessionStore } from '../stores/sessionStore';
import { useCartStore } from '../stores/cartStore';
import './SessionTabs.css';

interface SessionTabsProps {
  onNewSession?: () => void;
  cashRegisterCode?: string | null;
}

export const SessionTabs: React.FC<SessionTabsProps> = ({ onNewSession, cashRegisterCode }) => {
  const { sessions, activeSessionId, switchSession, removeSession, renameSession } = useSessionStore();
  const { cartsBySession, subtotal, taxAmount, total, switchToSession } = useCartStore();
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [summaryVisible, setSummaryVisible] = useState(false);

  if (sessions.length === 0) {
    return (
      <div className="session-tabs-container empty">
        <Empty 
          description="Sin tickets abiertos" 
          style={{ margin: '8px 0' }}
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={onNewSession}
          block
          style={{ marginTop: '8px' }}
        >
          Abrir Ticket
        </Button>
      </div>
    );
  }

  const handleRemoveSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSession(sessionId);
  };

  const handleRenameClick = (sessionId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingSessionId(sessionId);
    setNewName(currentName);
    setRenameModalVisible(true);
  };

  const handleRenameSubmit = () => {
    if (renamingSessionId && newName.trim()) {
      renameSession(renamingSessionId, newName.trim());
      setRenameModalVisible(false);
      setRenamingSessionId(null);
      setNewName('');
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeCart = activeSessionId ? cartsBySession[activeSessionId] : null;

  return (
    <div className="session-tabs-container">
      <div className="session-tabs-scroll">
        <Space size="small" wrap style={{ width: '100%' }}>
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const itemCount = cartsBySession[session.id]?.items?.length || 0;
            const displayName = session.customName || `Ticket ${session.id.substring(0, 6)}`;

            return (
              <Tooltip
                key={session.id}
                title={`${displayName} • ${itemCount} artículos`}
              >
                <div
                  className={`session-tab ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    switchSession(session.id);
                    switchToSession(session.id);
                  }}
                >
                  <Badge
                    count={itemCount > 0 ? itemCount : 0}
                    style={{ backgroundColor: isActive ? '#1890ff' : '#999' }}
                    className="session-badge"
                  >
                    <span className="session-tab-label">
                      {displayName}
                    </span>
                  </Badge>
                  {isActive && (
                    <Space size={4} style={{ marginLeft: '4px' }}>
                      <EditOutlined
                        className="session-edit-btn"
                        onClick={(e) => handleRenameClick(session.id, displayName, e)}
                      />
                      <CloseOutlined
                        className="session-close-btn"
                        onClick={(e) => handleRemoveSession(session.id, e)}
                      />
                    </Space>
                  )}
                </div>
              </Tooltip>
            );
          })}
          
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={onNewSession}
            className="session-new-btn"
            title="Nuevo ticket"
          />
        </Space>
      </div>

      {activeSessionId && (
        <div className="session-tabs-info">
          <Tag color="blue">{cashRegisterCode || 'Caja'}</Tag>
          <Tag color="cyan">ID: {activeSessionId.substring(0, 8)}...</Tag>
          <Button
            type="text"
            size="small"
            onClick={() => setSummaryVisible(true)}
            style={{ marginLeft: 'auto', fontSize: '12px' }}
          >
            Resumen
          </Button>
        </div>
      )}

      {/* Fase 4: Modal para renombrar sesión */}
      <Modal
        title="Renombrar Ticket"
        open={renameModalVisible}
        onOk={handleRenameSubmit}
        onCancel={() => setRenameModalVisible(false)}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Input
          placeholder="Mesa 1, Para llevar, etc."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          maxLength={30}
        />
      </Modal>

      {/* Fase 6: Modal de resumen por sesión */}
      <Modal
        title={`Resumen - ${activeSession?.customName || `Ticket ${activeSessionId?.substring(0, 6)}`}`}
        open={summaryVisible}
        onCancel={() => setSummaryVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSummaryVisible(false)}>
            Cerrar
          </Button>,
        ]}
        width={400}
      >
        <Card>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Artículos"
                value={activeCart?.items?.length || 0}
                prefix="📦"
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Transacciones"
                value={activeSession?.history?.length || 0}
                prefix="💳"
              />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: '16px' }}>
            <Col span={12}>
              <Statistic
                title="Subtotal"
                value={subtotal()}
                precision={2}
                prefix="$"
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Impuesto"
                value={taxAmount()}
                precision={2}
                prefix="$"
              />
            </Col>
          </Row>
          <Row style={{ marginTop: '16px' }}>
            <Col span={24}>
              <Statistic
                title="Total"
                value={total()}
                precision={2}
                prefix="$"
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
          </Row>
          {activeSession?.history && activeSession.history.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h4>Historial de Transacciones</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {activeSession.history.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '8px',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: '12px',
                    }}
                  >
                    <div>#{idx + 1} - ${item.amount.toFixed(2)}</div>
                    <div style={{ color: '#999' }}>
                      {item.paymentMethods.join(', ')} • {item.itemsCount} art.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </Modal>
    </div>
  );
};

export default SessionTabs;
