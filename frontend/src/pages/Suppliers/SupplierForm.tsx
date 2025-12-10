import { Form, Input, InputNumber, Button, Space, Row, Col, message, Rate } from 'antd';
import { useEffect } from 'react';
import { createSupplier, updateSupplier } from '../../services/purchasesApi';

const SupplierForm = ({ supplier, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const isEditing = !!supplier;

  useEffect(() => {
    if (supplier) {
      form.setFieldsValue({
        ...supplier,
        creditLimit: Number(supplier.creditLimit || 0),
        rating: supplier.rating || 3,
        creditDays: supplier.creditDays || 0,
      });
    } else {
      form.resetFields();
    }
  }, [supplier, form]);

  const handleSubmit = async (values) => {
    try {
      if (isEditing) {
        await updateSupplier(supplier.id, values);
      } else {
        await createSupplier(values);
      }
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      message.error(isEditing ? 'Error al actualizar proveedor' : 'Error al crear proveedor');
      console.error(error);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Código"
            name="code"
            rules={[{ required: true, message: 'Ingrese el código' }]}
          >
            <Input placeholder="SUP-001" maxLength={32} />
          </Form.Item>
        </Col>
        <Col span={16}>
          <Form.Item
            label="Razón Social"
            name="businessName"
            rules={[{ required: true, message: 'Ingrese la razón social' }]}
          >
            <Input placeholder="Empresa S.A. de C.V." maxLength={128} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Nombre Comercial" name="tradeName">
            <Input placeholder="Nombre Comercial" maxLength={128} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="RFC"
            name="rfc"
            rules={[
              { min: 12, max: 13, message: 'RFC inválido (12-13 caracteres)' },
            ]}
          >
            <Input placeholder="XAXX010101000" maxLength={13} style={{ textTransform: 'uppercase' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Nombre de Contacto" name="contactName">
            <Input placeholder="Juan Pérez" maxLength={128} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', message: 'Email inválido' }]}
          >
            <Input placeholder="contacto@empresa.com" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Teléfono" name="phone">
            <Input placeholder="3312345678" maxLength={20} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Celular" name="mobile">
            <Input placeholder="3398765432" maxLength={20} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Calle" name="street">
        <Input placeholder="Av. Principal 123" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Ciudad" name="city">
            <Input placeholder="Guadalajara" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Estado" name="state">
            <Input placeholder="Jalisco" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Código Postal" name="postalCode">
            <Input placeholder="44100" maxLength={10} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Términos de Pago" name="paymentTerms">
            <Input placeholder="30 días" maxLength={64} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Días de Crédito" name="creditDays" initialValue={0}>
            <InputNumber min={0} max={180} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Límite de Crédito" name="creditLimit" initialValue={0}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Calificación" name="rating" initialValue={3}>
            <Rate />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Notas" name="notes">
        <Input.TextArea rows={3} placeholder="Notas adicionales sobre el proveedor..." />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            {isEditing ? 'Actualizar' : 'Guardar'}
          </Button>
          <Button onClick={onCancel}>
            Cancelar
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default SupplierForm;
