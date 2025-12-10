import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface DashboardMetrics {
  totalSales: number;
  totalRevenue: number;
  totalPurchases: number;
  totalPurchaseCost: number;
  totalProducts: number;
  lowStockProducts: number;
  activeUsers: number;
  totalCompanies: number;
  salesTrend: Array<{ date: string; amount: number; count: number }>;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  purchasesBySupplier: Array<{ name: string; total: number; count: number }>;
}

export const dashboardApi = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const response = await axios.get(`${API_BASE_URL}/dashboard/metrics`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  },
};
