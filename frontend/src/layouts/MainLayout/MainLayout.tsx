import { Layout, Menu, Dropdown } from 'antd';
import { LogoutOutlined, DashboardOutlined, ShoppingOutlined, AppstoreOutlined, ShopOutlined, ShoppingCartOutlined } from '@ant-design/icons';
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
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: 'Productos',
      children: [
        {
          key: 'product-list',
          label: 'Productos',
          onClick: () => navigate('/products'),
        },
        {
          key: 'categories',
          label: 'Categorías',
          onClick: () => navigate('/products/categories'),
        },
      ],
    },
    {
      key: 'inventory',
      icon: <AppstoreOutlined />,
      label: 'Inventario',
      children: [
        {
          key: 'warehouses',
          label: 'Almacenes',
          onClick: () => navigate('/warehouses'),
        },
        {
          key: 'stock',
          label: 'Consulta de Stock',
          onClick: () => navigate('/inventory/stock'),
        },
        {
          key: 'lots',
          label: 'Gestión de Lotes',
          onClick: () => navigate('/inventory/lots'),
        },
        {
          key: 'movements',
          label: 'Movimientos',
          onClick: () => navigate('/inventory/movements'),
        },
        {
          key: 'adjustments',
          label: 'Ajustes',
          onClick: () => navigate('/inventory/adjustments'),
        },
        {
          key: 'waste',
          label: 'Desperdicios',
          onClick: () => navigate('/inventory/waste'),
        },
      ],
    },
    {
      key: 'purchases',
      icon: <ShoppingCartOutlined />,
      label: 'Compras',
      children: [
        {
          key: 'suppliers',
          icon: <ShopOutlined />,
          label: 'Proveedores',
          onClick: () => navigate('/suppliers'),
        },
        {
          key: 'purchase-orders',
          icon: <ShoppingCartOutlined />,
          label: 'Órdenes de Compra',
          onClick: () => navigate('/purchases'),
        },
      ],
    },
    {
      key: 'admin',
      label: 'Administración',
      children: [
        {
          key: 'admin-users',
          label: 'Usuarios',
          onClick: () => navigate('/admin/users'),
        },
        {
          key: 'admin-companies',
          label: 'Empresas',
          onClick: () => navigate('/admin/companies'),
        },
        {
          key: 'admin-branches',
          label: 'Sucursales',
          onClick: () => navigate('/admin/branches'),
        },
        {
          key: 'admin-cash-registers',
          label: 'Cajas',
          onClick: () => navigate('/admin/cash-registers'),
        },
        {
          key: 'admin-roles-permissions',
          label: 'Roles y Permisos',
          onClick: () => navigate('/admin/roles-permissions'),
        },
      ],
    },
  ];

  return (
    <Layout className="main-layout">
      <Sider breakpoint="lg" collapsedWidth="0" className="sider">
        <div className="logo" onClick={() => navigate('/dashboard')}>
          <img src="/logo-AtlasERP.png" alt="Atlas ERP" className="logo-img" />
        </div>
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
