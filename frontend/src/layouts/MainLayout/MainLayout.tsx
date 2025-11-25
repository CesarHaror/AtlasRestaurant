import { Layout, Menu, Dropdown } from 'antd';
import { LogoutOutlined, DashboardOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import './MainLayout.css';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

const { Header, Sider, Content } = Layout;

interface Props { children: ReactNode }

export default function MainLayout({ children }: Props) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />, 
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
  ];

  return (
    <Layout className="main-layout">
      <Sider breakpoint="lg" collapsedWidth="0" className="sider">
        <div className="logo">Atlas ERP</div>
        <Menu theme="dark" mode="inline" items={menuItems} />
      </Sider>
      <Layout>
        <Header className="header">
          <div className="header-right">
            <Dropdown menu={{ items: [
              { key: 'user', label: user?.username || 'Usuario', disabled: true },
              { type: 'divider' },
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Cerrar Sesión',
                onClick: () => {
                  logout();
                  navigate('/login');
                },
              },
            ]}} trigger={['click']}>
              <span className="user-chip">{user?.username}</span>
            </Dropdown>
          </div>
        </Header>
        <Content className="content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
