import { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import type { AuthResponse } from '../types';
import api from '../services/api';
import './LoginPage.css';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);
      const response = await api.post<AuthResponse>('/auth/login', {
        username: values.username,
        password: values.password,
      });

      const { accessToken, user } = response.data;

      // Guardar token
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      message.success(`¡Bienvenido ${user.username}!`);
      onLoginSuccess();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al iniciar sesión');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <Card className="login-card" bordered={false}>
        <div className="login-logo-wrap">
          <img src="/logo-AtlasERP.png" alt="Atlas POS" className="login-logo" />
        </div>
        <Typography.Text className="login-subtitle">Inicia sesión para continuar</Typography.Text>
        <Form form={form} layout="vertical" onFinish={handleLogin}>
          <Form.Item name="username" label="Usuario" rules={[{ required: true, message: 'Ingresa tu usuario' }]}>
            <Input prefix={<UserOutlined />} placeholder="usuario" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="Contraseña" rules={[{ required: true, message: 'Ingresa tu contraseña' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="******" autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Iniciar Sesión</Button>
        </Form>
        <div className="footer-hint">© {new Date().getFullYear()} Atlas POS</div>
      </Card>
    </div>
  );
};

export default LoginPage;
