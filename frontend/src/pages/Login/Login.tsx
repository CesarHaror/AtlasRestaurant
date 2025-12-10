import { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import './Login.css';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login, loading, error } = useAuthStore();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function onFinish(values: any) {
    setSubmitting(true);
    const ok = await login(values.username, values.password);
    setSubmitting(false);
    if (ok) {
      message.success('Bienvenido');
      navigate('/dashboard');
    } else if (error) {
      message.error(error);
    }
  }

  return (
    <div className="login-wrapper">
      <Card className="login-card" bordered={false}>
        <div className="login-logo-wrap">
          <img src="/logo-AtlasERP.png" alt="Atlas ERP" className="login-logo" />
        </div>
        <Typography.Text className="login-subtitle">Inicia sesión para continuar</Typography.Text>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label="Usuario" rules={[{ required: true, message: 'Ingresa tu usuario' }]}>
            <Input prefix={<UserOutlined />} placeholder="usuario" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="Contraseña" rules={[{ required: true, message: 'Ingresa tu contraseña' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="******" autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={submitting || loading}>Iniciar Sesión</Button>
        </Form>
        <div className="footer-hint">© {new Date().getFullYear()} Atlas ERP</div>
      </Card>
    </div>
  );
}
