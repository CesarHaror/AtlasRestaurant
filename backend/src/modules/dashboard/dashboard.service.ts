import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between, IsNull, LessThanOrEqual } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Purchase } from '../purchases/entities/purchase.entity';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { InventoryLot } from '../inventory/entities/inventory-lot.entity';

export interface DashboardMetrics {
  totalSales: number;
  totalRevenue: number;
  totalPurchases: number;
  totalPurchaseCost: number;
  totalProducts: number;
  lowStockProducts: number;
  activeUsers: number;
  totalCompanies: number;
  
  // Trend data for charts
  salesTrend: Array<{ date: string; amount: number; count: number }>;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  purchasesBySupplier: Array<{ name: string; total: number; count: number }>;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(InventoryLot)
    private lotRepository: Repository<InventoryLot>,
  ) {}

  async getMetrics(): Promise<DashboardMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Sales metrics
    const [salesToday, totalSales] = await Promise.all([
      this.saleRepository
        .createQueryBuilder('sale')
        .where('sale.createdAt >= :today', { today })
        .select('SUM(sale.totalAmount)', 'total')
        .addSelect('COUNT(*)', 'count')
        .getRawOne<{ total: string; count: string }>(),
      this.saleRepository
        .createQueryBuilder('sale')
        .select('SUM(sale.totalAmount)', 'total')
        .getRawOne<{ total: string }>(),
    ]);

    // Purchase metrics
    const purchases = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .select('SUM(purchase.totalAmount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .getRawOne<{ total: string; count: string }>();

    // Product metrics - Count low stock products (lots with currentQuantity <= 10)
    const [totalProducts, lowStockCount] = await Promise.all([
      this.productRepository.count(),
      this.lotRepository
        .createQueryBuilder('lot')
        .select('COUNT(DISTINCT lot.productId)', 'count')
        .where('lot.currentQuantity <= :threshold', { threshold: 10 })
        .getRawOne<{ count: string }>()
        .then(r => parseInt(r?.count || '0', 10)),
    ]);

    // User and Company metrics
    const [activeUsers, totalCompanies] = await Promise.all([
      this.userRepository.count({ where: { isActive: true } }),
      this.companyRepository.count(),
    ]);

    // Get trend data (last 7 days)
    const salesTrend = await this.getSalesTrendData();
    const topProducts = await this.getTopProducts();
    const purchasesBySupplier = await this.getPurchasesBySupplier();

    return {
      totalSales: parseInt(salesToday?.count || '0', 10),
      totalRevenue: parseFloat(salesToday?.total || '0'),
      totalPurchases: parseInt(purchases?.count || '0', 10),
      totalPurchaseCost: parseFloat(purchases?.total || '0'),
      totalProducts,
      lowStockProducts: lowStockCount,
      activeUsers,
      totalCompanies,
      salesTrend,
      topProducts,
      purchasesBySupplier,
    };
  }

  private async getSalesTrendData(): Promise<Array<{ date: string; amount: number; count: number }>> {
    try {
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      const results = await this.saleRepository.query(
        `
        SELECT 
          DATE(created_at) as date,
          SUM(CAST(total_amount AS FLOAT)) as amount,
          COUNT(*) as count
        FROM sales
        WHERE created_at >= $1
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
        [last7Days],
      );

      return results.map((r: any) => ({
        date: r.date ? new Date(r.date).toLocaleDateString() : '',
        amount: parseFloat(r.amount || '0'),
        count: parseInt(r.count, 10),
      }));
    } catch (error) {
      console.error('Error getting sales trend:', error);
      return [];
    }
  }

  private async getTopProducts(): Promise<Array<{ name: string; quantity: number; revenue: number }>> {
    try {
      const lastMonth = new Date();
      lastMonth.setDate(lastMonth.getDate() - 30);

      const results = await this.saleRepository
        .query(
          `
          SELECT 
            p.name,
            SUM(CAST(si.quantity AS FLOAT)) as quantity,
            SUM(CAST(si.total_amount AS FLOAT)) as revenue
          FROM sale_items si
          JOIN sales s ON si.sale_id = s.id
          JOIN products p ON si.product_id = p.id
          WHERE s.created_at >= $1
          GROUP BY p.id, p.name
          ORDER BY revenue DESC
          LIMIT 5
        `,
          [lastMonth],
        );

      return results.map((r: any) => ({
        name: r.name || 'N/A',
        quantity: Math.round(parseFloat(r.quantity || '0')),
        revenue: parseFloat(r.revenue || '0'),
      }));
    } catch (error) {
      console.error('Error getting top products:', error);
      return [];
    }
  }

  private async getPurchasesBySupplier(): Promise<Array<{ name: string; total: number; count: number }>> {
    try {
      const lastMonth = new Date();
      lastMonth.setDate(lastMonth.getDate() - 30);

      // Retornar datos vacíos si la tabla de suppliers no existe
      // ya que puede que esté almacenada de otra forma
      return [];
    } catch (error) {
      console.error('Error getting purchases by supplier:', error);
      return [];
    }
  }
}
