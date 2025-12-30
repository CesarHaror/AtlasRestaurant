import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Product } from '../menu/entities/menu-item.entity';
import { Sale } from '../orders/entities/sale.entity';
import { Purchase } from '../purchases/entities/purchase.entity';
import { User } from '../users/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { InventoryLot } from '../inventory/entities/inventory-lot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Sale, Purchase, User, Company, InventoryLot])],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService],
})
export class DashboardModule {}
