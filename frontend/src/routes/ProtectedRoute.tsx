import { useAuthStore } from '../store/authStore';
import { Navigate, Outlet } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout/MainLayout';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function ProtectedRoute() {
  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <ErrorBoundary>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </ErrorBoundary>
  );
}
