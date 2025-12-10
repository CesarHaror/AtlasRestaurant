import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { SuppliersService } from './suppliers.service';
import { Purchase } from './entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { Supplier } from './entities/supplier.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Purchase, PurchaseItem, Supplier]),
    InventoryModule,
    ProductsModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService, SuppliersService],
  exports: [PurchasesService, SuppliersService],
})
export class PurchasesModule {}