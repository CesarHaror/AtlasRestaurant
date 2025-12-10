import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, Tag, Result } from 'antd';
import { CheckCircleOutlined, ExclamationOutlined } from '@ant-design/icons';
import { branchesService } from '../services/api';
import './BranchSelector.css';

interface BranchSelectorProps {
  userBranchId?: number;
  onBranchConfirm: (branchId: number, branchName: string) => void;
}

const BranchSelector: React.FC<BranchSelectorProps> = ({
  userBranchId,
  onBranchConfirm,
}) => {
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [branchName, setBranchName] = useState<string | null>(null);

  useEffect(() => {
    loadBranchName();
  }, [userBranchId]);

  const loadBranchName = async () => {
    if (!userBranchId) {
      console.log('⚠️ BranchSelector: No userBranchId provided');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      console.log('🔍 BranchSelector: Loading branch', userBranchId);
      const response = await branchesService.getById(userBranchId);
      console.log('✅ BranchSelector: Branch loaded:', response.data.name);
      setBranchName(response.data.name);
    } catch (error) {
      console.error('❌ BranchSelector: Error loading branch:', error);
      setBranchName(`Sucursal ${userBranchId}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="branch-selector-container">
        <Spin size="large" tip="Cargando sucursal..." />
      </div>
    );
  }

  if (!userBranchId || !branchName) {
    return (
      <div className="branch-selector-container">
        <Result
          status="warning"
          icon={<ExclamationOutlined />}
          title="Sin Sucursal Asignada"
          subTitle="No tienes una sucursal asignada. Contacta al administrador para asignarte una sucursal."
        />
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="branch-selector-container">
        <Result
          status="success"
          icon={<CheckCircleOutlined />}
          title="Sucursal Confirmada"
          subTitle={`Trabajarás en la sucursal: ${branchName}`}
        />
      </div>
    );
  }

  const handleConfirmBranch = () => {
    setConfirmed(true);
    onBranchConfirm(userBranchId, branchName);
  };

  return (
    <div className="branch-selector-container">
      <Card
        className="branch-selector-card"
        bordered={false}
        style={{ maxWidth: '500px', margin: '0 auto' }}
      >
        <div className="branch-selector-header">
          <h2>Selecciona tu Sucursal</h2>
          <p>Confirma la sucursal donde trabajarás hoy</p>
        </div>

        <div className="branch-info">
          <Tag color="blue" style={{ fontSize: '16px', padding: '8px 16px' }}>
            {branchName}
          </Tag>
        </div>

        <div className="branch-selector-footer">
          <Button
            type="primary"
            size="large"
            onClick={handleConfirmBranch}
            style={{ minWidth: '200px' }}
          >
            Confirmar Sucursal
          </Button>
        </div>

        <p className="branch-selector-note">
          ℹ️ Una vez confirmada la sucursal, podrás seleccionar una caja para comenzar a trabajar.
        </p>
      </Card>
    </div>
  );
};

export default BranchSelector;
