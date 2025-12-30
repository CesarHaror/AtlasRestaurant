import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/Login/Login';
import DashboardPage from './pages/Dashboard/Dashboard';
import ProductList from './pages/Products/ProductList';
import CategoriesList from './pages/Products/CategoriesList';
import WarehouseList from './pages/Warehouses/WarehouseList';
import StockQuery from './pages/Inventory/StockQuery';
import AdjustmentsList from './pages/Inventory/AdjustmentsList';
import WasteRecords from './pages/Inventory/WasteRecords';
import LotsList from './pages/Inventory/LotsList';
import MovementsList from './pages/Inventory/MovementsList';
import SuppliersList from './pages/Suppliers/SuppliersList';
import PurchasesList from './pages/Purchases/PurchasesList';
import PurchaseForm from './pages/Purchases/PurchaseForm';
import UsersList from './pages/Admin/UsersList';
import RestaurantsList from './pages/Admin/RestaurantsList';
import BranchesList from './pages/Admin/BranchesList';
import RolesPermissions from './pages/Admin/RolesPermissions';
import CashRegistersPage from './pages/CashRegistersPage.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/menu" element={<ProductList />} />
          <Route path="/menu/categories" element={<CategoriesList />} />
          <Route path="/warehouses" element={<WarehouseList />} />
          <Route path="/inventory/stock" element={<StockQuery />} />
          <Route path="/inventory/adjustments" element={<AdjustmentsList />} />
          <Route path="/inventory/waste" element={<WasteRecords />} />
          <Route path="/inventory/lots" element={<LotsList />} />
          <Route path="/inventory/movements" element={<MovementsList />} />
          <Route path="/suppliers" element={<SuppliersList />} />
          <Route path="/purchases" element={<PurchasesList />} />
          <Route path="/purchases/new" element={<PurchaseForm />} />
          <Route path="/admin/users" element={<UsersList />} />
          <Route path="/admin/restaurants" element={<RestaurantsList />} />
          <Route path="/admin/branches" element={<BranchesList />} />
          <Route path="/admin/roles-permissions" element={<RolesPermissions />} />
          <Route path="/admin/cash-registers" element={<CashRegistersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
