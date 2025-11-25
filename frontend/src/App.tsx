import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/Login/Login';
import DashboardPage from './pages/Dashboard/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
