import { useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POSPage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token guardado
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <ConfigProvider locale={esES}>
      {isAuthenticated ? (
        <POSPage onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </ConfigProvider>
  );
}

export default App;
