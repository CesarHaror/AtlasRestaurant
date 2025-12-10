import { useEffect, useState } from 'react';
import { Layout, Button, Space, Drawer, message, Tag, Card } from 'antd';
import { LogoutOutlined, ArrowLeftOutlined, ShoppingCartOutlined, HistoryOutlined } from '@ant-design/icons';
import ProductGrid from '../components/ProductGrid';
import Cart from '../components/Cart';
import CategoryCarousel from '../components/CategoryCarousel';
import PaymentModal from '../components/PaymentModal';
import Clock from '../components/Clock';
import PaymentSuccess from '../components/PaymentSuccess';
import SessionManager from '../components/SessionManager';
import SessionTabs from '../components/SessionTabs';
import SessionArchive from '../components/SessionArchive';
import CashRegisterSelector from '../components/CashRegisterSelector';
import { useCartStore } from '../stores/cartStore';
import { useSessionStore } from '../stores/sessionStore';
import { cashRegisterService, salesService, inventoryService } from '../services/api';
import type { PaymentMethod, User } from '../types';
import './POSPage.css';

const { Header, Content } = Layout;

type ScreenType = 'products' | 'payment' | 'confirmation';

interface POSPageProps {
  onLogout: () => void;
}

interface ConfirmationData {
  items: any[];
  subtotal: number;
  taxAmount: number;
  total: number;
  payments: PaymentMethod[];
}

const POSPage = ({ onLogout }: POSPageProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('products');
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
  const [sessionManagerVisible, setSessionManagerVisible] = useState(false);
  const [sessionArchiveVisible, setSessionArchiveVisible] = useState(false);
  const [branchName, setBranchName] = useState<string | null>(null);
  const [cashRegisterCode, setCashRegisterCode] = useState<string | null>(null);
  const [cashRegisterConfirmed, setCashRegisterConfirmed] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const { items, clear, subtotal, taxAmount, total, switchToSession } = useCartStore();
  const { getActiveSession, addSession, switchSession, isOpen } = useSessionStore();

  useEffect(() => {
    // Load user from localStorage to get branchId
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        console.log('🔍 User loaded from localStorage:', user);
        setCurrentUser(user);
        
        // Load branch name automatically
        if (user.branchId) {
          loadBranchInfo(user.branchId);
        }
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }
    } else {
      console.log('⚠️ No user in localStorage');
    }
    loadSession();
  }, []);

  const loadBranchInfo = async (branchId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/branches/${branchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const text = await response.text();
        console.log('📝 Branch response:', text);
        if (text) {
          const branch = JSON.parse(text);
          console.log('✅ Branch loaded:', branch.name);
          setBranchName(branch.name);
        }
      } else {
        console.error('❌ Branch response error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error loading branch info:', error);
    }
  };

  const loadSession = async () => {
    try {
      setSessionLoading(true);
      const response = await cashRegisterService.getActiveSessions();
      // Response es una sesión única o null
      if (response.data) {
        addSession(response.data);
        switchToSession(response.data.id);
        switchSession(response.data.id);
        // Enriquecer con datos de Caja y Sucursal
        try {
          const cashRegId = response.data.cashRegisterId || (response.data as any).cashRegister?.id;
          if (!cashRegId) {
            console.warn('⚠️ No cashRegisterId found in session:', response.data);
            return;
          }
          const crResp = await cashRegisterService.getById(cashRegId);
          const cr = crResp.data;
          setCashRegisterCode(cr?.code || cr?.name || cr?.id?.substring(0, 8) || null);
        } catch (e) {
          console.warn('⚠️ No se pudo cargar datos de caja para la sesión activa', e);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleOpenSession = async () => {
    try {
      const response = await cashRegisterService.getAll();
      if (response.data && response.data.length > 0) {
        const cashRegister = response.data[0];
        const sessionResponse = await cashRegisterService.openSession(cashRegister.id, 0);
        addSession(sessionResponse.data);
        switchToSession(sessionResponse.data.id);
        switchSession(sessionResponse.data.id);
        message.success('Sesión abierta correctamente');
      }
    } catch (error) {
      message.error('Error al abrir sesión');
      console.error('Error:', error);
    }
  };

  const handleCashRegisterConfirm = (cashRegisterId: string, cashRegisterCode: string) => {
    setCashRegisterConfirmed(true);
    setCashRegisterCode(cashRegisterCode);
    console.log('✅ Cash register confirmed:', { cashRegisterId, cashRegisterCode });
  };

  const handlePaymentSuccess = async (payments: PaymentMethod[]) => {
    try {
      setCheckoutLoading(true);

      if (!getActiveSession()) {
        message.error('No hay sesión activa');
        return;
      }

      // Obtener el primer cash register para obtener su ID
      const cashRegisters = await cashRegisterService.getAll();
      const cashRegisterId = cashRegisters.data?.[0]?.id;

      if (!cashRegisterId) {
        message.error('No se encontró caja registradora');
        return;
      }

      // Validación previa: verificar stock disponible por producto en la sucursal
      for (const item of items) {
        try {
          const stockResp = await inventoryService.getProductStock(item.productId);
          const available = Number(stockResp.data?.total || stockResp.data || 0);
          if (available < item.quantity) {
            message.error(`Stock insuficiente para ${item.name}. Disponible: ${available}, Solicitado: ${item.quantity}`);
            setCheckoutLoading(false);
            return;
          }
        } catch (e) {
          // Si el endpoint devuelve 404 o similar, continuar y dejar que backend valide
          console.warn('No se pudo verificar stock en cliente:', e);
        }
      }

      const sessionId = getActiveSession()!.id;
      const saleData = {
        cashRegisterId: cashRegisterId,
        sessionId: sessionId,
          // Enviar weight solo si se requiere (evitar forzar 0.001 que causa verificación errónea de stock)
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        payments: payments.map((p) => ({
          paymentMethod: p.method.toUpperCase(),
          amount: p.amount,
        })),
      };

      await salesService.create(saleData);
      message.success('Venta procesada correctamente');

      // Fase 5: Agregar al historial de la sesión
      const { addToHistory } = useSessionStore.getState();
      addToHistory(sessionId, {
        id: `hist_${Date.now()}`,
        timestamp: new Date(),
        amount: total(),
        itemsCount: items.length,
        paymentMethods: payments.map(p => p.method),
      });

      // Store confirmation data and transition to confirmation screen
      setConfirmationData({
        items: items,
        subtotal: subtotal(),
        taxAmount: taxAmount(),
        total: total(),
        payments: payments,
      });

      clear();
      setCurrentScreen('confirmation');
    } catch (error: any) {
      const resp = error?.response?.data;
      const msg = Array.isArray(resp?.message)
        ? resp.message.join(', ')
        : resp?.message || resp?.error || 'Error al procesar la venta';
      message.error(msg);
      console.error('❌ Error creando venta:', {
        status: error?.response?.status,
        data: resp,
        fullError: error,
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!isOpen()) {
      message.error('Debe abrir una sesión de caja primero');
      return;
    }
    if (items.length === 0) {
      message.error('El carrito está vacío');
      return;
    }
    setCurrentScreen('payment');
  };

  const handleNewSale = () => {
    setCurrentScreen('products');
    setConfirmationData(null);
  };

  const handleBackToProducts = () => {
    setCurrentScreen('products');
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Full-Screen Header with Clock */}
      <Header className="pos-header-fullscreen">
        <div className="pos-header-top">
          <div className="pos-header-left">
            {currentScreen !== 'products' && (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToProducts}
                size="large"
                style={{ color: '#fff', marginRight: '12px' }}
              >
                Volver
              </Button>
            )}
            <div className="pos-logo-title">
              <div className="pos-logo">
                <img src="/logo-AtlasERP.png" alt="Atlas Logo" className="logo-image" />
              </div>
              <h1 className="pos-title-fullscreen">Atlas POS</h1>
            </div>
            {getActiveSession() && isOpen() && (
              <Tag color="green" style={{ marginLeft: '12px' }}>Sesión: {getActiveSession()!.id.substring(0, 8)}...</Tag>
            )}
          </div>
          
          <div className="pos-header-center">
            <Clock />
          </div>

          <div className="pos-header-right">
            <Space size="small">
              {getActiveSession() && isOpen() && (
                <>
                  {cashRegisterCode && (
                    <Tag color="geekblue">Caja: {cashRegisterCode}</Tag>
                  )}
                  <Button
                    size="small"
                    onClick={() => setSessionManagerVisible(true)}
                  >
                    Gestionar Sesiones
                  </Button>
                  <Button
                    icon={<HistoryOutlined />}
                    size="small"
                    onClick={() => setSessionArchiveVisible(true)}
                    title="Ver historial de sesiones completadas"
                  >
                    Historial
                  </Button>
                </>
              )}
              {!isOpen() && (
                <Button
                  type="primary"
                  size="small"
                  onClick={handleOpenSession}
                  loading={sessionLoading}
                >
                  Abrir Sesión
                </Button>
              )}
              <Button 
                icon={<LogoutOutlined />} 
                onClick={onLogout} 
                danger
                size="small"
              >
                Salir
              </Button>
            </Space>
          </div>
        </div>
      </Header>

      {/* Multi-Screen Content */}
      <Content className="pos-content-fullscreen">
        {!cashRegisterConfirmed ? (
          // Cash Register Selector Screen - ALWAYS show until confirmed
          <div style={{ padding: '40px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {currentUser?.branchId && branchName ? (
              <CashRegisterSelector
                userBranchId={currentUser.branchId}
                branchName={branchName}
                onCashRegisterConfirm={handleCashRegisterConfirm}
              />
            ) : (
              <Card style={{ width: '100%', maxWidth: '500px' }}>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <h2>Cargando información...</h2>
                  <p>Por favor espera mientras se carga tu información...</p>
                </div>
              </Card>
            )}
          </div>
        ) : !isOpen() ? (
          // Session selector screen - Show after branch confirmed but no session open
          <div style={{ padding: '40px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card style={{ width: '100%', maxWidth: '500px' }}>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <h2>Abrir Nueva Sesión</h2>
                <p>No hay una sesión activa. Abre una sesión para comenzar.</p>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleOpenSession}
                  loading={sessionLoading}
                  style={{ minWidth: '200px' }}
                >
                  Abrir Sesión
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          // POS Screen - Show when branch confirmed and session is open
          <>
            {currentScreen === 'products' && (
              <div className={`screen-container screen-${currentScreen}`}>
                <SessionTabs 
                  onNewSession={handleOpenSession}
                  cashRegisterCode={cashRegisterCode}
                />
                <div className="pos-main-fullscreen">
                  <div className="products-section-fullscreen">
                    <ProductGrid selectedCategoryId={selectedCategoryId} />
                  </div>

                  <div className="categories-section-fullscreen">
                    <CategoryCarousel 
                      selectedCategoryId={selectedCategoryId}
                      onCategorySelect={setSelectedCategoryId}
                    />
                  </div>

                  <div className="cart-section-fullscreen">
                    <Cart
                      onCheckout={handleCheckout}
                      checkoutLoading={checkoutLoading}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentScreen === 'payment' && (
              <div className={`screen-container screen-${currentScreen}`}>
                <div style={{ padding: '40px' }}>
                  <PaymentModal
                    visible={true}
                    total={total()}
                    onPaymentSuccess={handlePaymentSuccess}
                    onCancel={handleBackToProducts}
                    loading={checkoutLoading}
                  />
                </div>
              </div>
            )}

            {currentScreen === 'confirmation' && confirmationData && (
              <div className={`screen-container screen-${currentScreen}`}>
                <PaymentSuccess
                  items={confirmationData.items}
                  subtotal={confirmationData.subtotal}
                  taxAmount={confirmationData.taxAmount}
                  total={confirmationData.total}
                  payments={confirmationData.payments}
                  onNewSale={handleNewSale}
                  saleNumber={`${Date.now()}`}
                  cashRegisterCode={cashRegisterCode || 'Caja 1'}
                  branchName={branchName || 'Sucursal Principal'}
                  userName={currentUser?.username || 'Usuario'}
                  companyName="AtlasERP"
                />
              </div>
            )}
          </>
        )}
      </Content>

      {/* Session Manager Drawer */}
      <Drawer
        title="Gestionar Sesiones"
        placement="left"
        onClose={() => setSessionManagerVisible(false)}
        open={sessionManagerVisible}
        width={500}
      >
        <SessionManager
          onSessionSelect={() => setSessionManagerVisible(false)}
          onClose={() => setSessionManagerVisible(false)}
          userBranchId={currentUser?.branchId}
        />
      </Drawer>

      {/* Mobile cart drawer (optional, for smaller screens) */}
      <Button
        className="cart-drawer-button-fullscreen"
        icon={<ShoppingCartOutlined />}
        onClick={() => setDrawerOpen(true)}
      >
        Carrito ({items.length})
      </Button>

      <Drawer
        title={`Carrito (${items.length})`}
        placement="bottom"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        height="80%"
      >
        <Cart
          onCheckout={handleCheckout}
          checkoutLoading={checkoutLoading}
        />
      </Drawer>

      {/* Fase 5: Session Archive Modal */}
      <SessionArchive
        visible={sessionArchiveVisible}
        onClose={() => setSessionArchiveVisible(false)}
      />
    </Layout>
  );
};

export default POSPage;
