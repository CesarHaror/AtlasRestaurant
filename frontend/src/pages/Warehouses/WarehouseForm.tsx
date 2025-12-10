import React, { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, Switch, Button, message, Space } from 'antd';
import { Warehouse, WarehouseType, CreateWarehouseDto } from '../../types/inventory';
import { createWarehouse, updateWarehouse } from '../../services/inventoryApi';

const { Option } = Select;

interface WarehouseFormProps {
  warehouse: Warehouse | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const WarehouseForm: React.FC<WarehouseFormProps> = ({
  warehouse,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasTemperatureControl, setHasTemperatureControl] = useState(false);

  useEffect(() => {
    if (warehouse) {
      form.setFieldsValue({
        ...warehouse,
      });
      setHasTemperatureControl(warehouse.hasTemperatureControl);
    } else {
      form.resetFields();
      setHasTemperatureControl(false);
    }
  }, [warehouse, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const data: CreateWarehouseDto = {
        branchId: values.branchId || 1, // Sucursal Principal por defecto
        code: values.code,
        name: values.name,
        warehouseType: values.warehouseType,
        hasTemperatureControl: values.hasTemperatureControl || false,
        targetTemperature: values.hasTemperatureControl ? values.targetTemperature : undefined,
        isActive: values.isActive !== false,
      };

      if (warehouse) {
        await updateWarehouse(warehouse.id, data);
        message.success('Almacén actualizado exitosamente');
      } else {
        await createWarehouse(data);
        message.success('Almacén creado exitosamente');
      }

      onSuccess();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al guardar almacén';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        hasTemperatureControl: false,
        isActive: true,
      }}
    >
      <Form.Item
        label="Código"
        name="code"
        rules={[
          { required: true, message: 'El código es requerido' },
          { max: 20, message: 'Máximo 20 caracteres' },
        ]}
      >
        <Input placeholder="Ej: ALM-001" />
      </Form.Item>

      <Form.Item
        label="Nombre"
        name="name"
        rules={[
          { required: true, message: 'El nombre es requerido' },
          { max: 100, message: 'Máximo 100 caracteres' },
        ]}
      >
        <Input placeholder="Ej: Cámara Fría Principal" />
      </Form.Item>

      <Form.Item
        label="Tipo de Almacén"
        name="warehouseType"
        rules={[{ required: true, message: 'El tipo es requerido' }]}
      >
        <Select placeholder="Selecciona un tipo">
          <Option value={WarehouseType.COLD_STORAGE}>Cámara Fría</Option>
          <Option value={WarehouseType.DRY_STORAGE}>Almacén Seco</Option>
          <Option value={WarehouseType.DISPLAY}>Exhibición</Option>
          <Option value={WarehouseType.FREEZER}>Congelador</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Control de Temperatura"
        name="hasTemperatureControl"
        valuePropName="checked"
      >
        <Switch
          onChange={(checked) => {
            setHasTemperatureControl(checked);
            if (!checked) {
              form.setFieldsValue({ targetTemperature: undefined });
            }
          }}
        />
      </Form.Item>

      {hasTemperatureControl && (
        <Form.Item
          label="Temperatura Objetivo (°C)"
          name="targetTemperature"
          rules={[
            {
              required: hasTemperatureControl,
              message: 'La temperatura es requerida',
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Ej: 4"
            min={-50}
            max={50}
            step={0.1}
          />
        </Form.Item>
      )}

      <Form.Item label="Estado" name="isActive" valuePropName="checked">
        <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {warehouse ? 'Actualizar' : 'Crear'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default WarehouseForm;
