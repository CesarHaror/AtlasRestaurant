import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, Tag, Result, List, message } from 'antd';
import { CheckCircleOutlined, ExclamationOutlined, BankOutlined } from '@ant-design/icons';
import type { CashRegister } from '../types';
import './CashRegisterSelector.css';

interface CashRegisterSelectorProps {
  userBranchId: number;
  branchName: string;
  onCashRegisterConfirm: (cashRegisterId: string, cashRegisterCode: string) => void;
}

const CashRegisterSelector: React.FC<CashRegisterSelectorProps> = ({
  userBranchId,
  branchName,
  onCashRegisterConfirm,
}) => {
  const [loading, setLoading] = useState(true);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [selectedCashRegister, setSelectedCashRegister] = useState<CashRegister | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    loadCashRegisters();
  }, [userBranchId]);

  const loadCashRegisters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔍 Loading cash registers for branch:', userBranchId);
      
      const response = await fetch(
        `/api/cash-registers?branchId=${userBranchId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Filtrar solo cajas activas (manejar ambas convenciones: isActive e is_active)
        const activeCashRegisters = data.filter((cr: any) => cr.isActive || cr.is_active);
        console.log('✅ Cash registers loaded:', activeCashRegisters);
        setCashRegisters(activeCashRegisters);
        
        // Si solo hay una caja, seleccionarla automáticamente
        if (activeCashRegisters.length === 1) {
          setSelectedCashRegister(activeCashRegisters[0]);
        }
      } else {
        console.error('Error loading cash registers:', response.statusText);
        message.error('No se pudieron cargar las cajas de registro');
      }
    } catch (error) {
      console.error('Error loading cash registers:', error);
      message.error('Error al cargar las cajas registradoras');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCashRegister = (cashRegister: CashRegister) => {
    setSelectedCashRegister(cashRegister);
  };

  const handleConfirm = () => {
    if (!selectedCashRegister) {
      message.warning('Por favor selecciona una caja registradora');
      return;
    }

    setConfirmLoading(true);
    // Simular pequeña espera para mejor UX
    setTimeout(() => {
      console.log('✅ Cash register confirmed:', selectedCashRegister);
      onCashRegisterConfirm(selectedCashRegister.id, selectedCashRegister.code);
      setConfirmLoading(false);
    }, 300);
  };

  if (loading) {
    return (
      <div className="cash-register-selector-container">
        <Spin size="large" tip="Cargando cajas registradoras..." />
      </div>
    );
  }

  if (cashRegisters.length === 0) {
    return (
      <div className="cash-register-selector-container">
        <Result
          status="warning"
          icon={<ExclamationOutlined />}
          title="Sin Cajas Disponibles"
          subTitle="No hay cajas registradoras activas disponibles en tu sucursal. Contacta al administrador."
        />
      </div>
    );
  }

  return (
    <div className="cash-register-selector-container">
      <Card
        className="cash-register-selector-card"
        bordered={false}
        style={{ maxWidth: '900px', margin: '0 auto' }}
      >
        <div className="cash-register-selector-header">
          <h2>
            <BankOutlined style={{ marginRight: '8px' }} />
            Selecciona tu Caja Registradora
          </h2>
          <p>Sucursal: <strong>{branchName}</strong></p>
        </div>

        <div className="cash-register-list">
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
            dataSource={cashRegisters}
            renderItem={(cashRegister) => (
              <List.Item key={cashRegister.id}>
                <Card
                  hoverable
                  onClick={() => handleSelectCashRegister(cashRegister)}
                  className={`cash-register-card ${
                    selectedCashRegister?.id === cashRegister.id
                      ? 'cash-register-card-selected'
                      : ''
                  }`}
                  style={{
                    border:
                      selectedCashRegister?.id === cashRegister.id
                        ? '2px solid #1890ff'
                        : '1px solid #d9d9d9',
                    cursor: 'pointer',
                  }}
                >
                  <div className="cash-register-info">
                    <div className="cash-register-code">
                      <strong>{cashRegister.code}</strong>
                    </div>
                    <p className="cash-register-name">{cashRegister.name}</p>
                    
                    {(cashRegister.deviceIdentifier || cashRegister.device_identifier) && (
                      <Tag color="cyan" style={{ marginTop: '8px' }}>
                        {cashRegister.deviceIdentifier || cashRegister.device_identifier}
                      </Tag>
                    )}

                    {(cashRegister.hasScale || cashRegister.has_scale) && (
                      <Tag color="green" style={{ marginTop: '4px', marginLeft: '4px' }}>
                        ⚖️ Con Báscula
                      </Tag>
                    )}

                    {selectedCashRegister?.id === cashRegister.id && (
                      <div style={{ marginTop: '12px', textAlign: 'center' }}>
                        <Tag color="blue" icon={<CheckCircleOutlined />}>
                          Seleccionada
                        </Tag>
                      </div>
                    )}
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </div>

        <div className="cash-register-selector-footer">
          <Button
            type="primary"
            size="large"
            onClick={handleConfirm}
            loading={confirmLoading}
            disabled={!selectedCashRegister}
            style={{ minWidth: '200px' }}
          >
            Confirmar Caja
          </Button>
        </div>

        <p className="cash-register-selector-note">
          ℹ️ Una vez confirmada la caja, podrás abrir sesión y comenzar a trabajar.
        </p>
      </Card>
    </div>
  );
};

export default CashRegisterSelector;
