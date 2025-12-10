// (removed duplicate minimal module; keeping the full-feature module below)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Sales entities
import { Customer } from './entities/customer.entity';
import { CashRegister } from './entities/cash-register.entity';
import { CashRegisterSession } from './entities/cash-register-session.entity';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { SalePayment } from './entities/sale-payment.entity';

// Dependencies - Other modules
import { Product } from '../products/entities/product.entity';
import { Warehouse } from '../inventory/entities/warehouse.entity';
import { InventoryLot } from '../inventory/entities/inventory-lot.entity';
import { InventoryMovement } from '../inventory/entities/inventory-movement.entity';
import { Branch } from '../branches/entities/branch.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

// Controllers
import { SalesController } from './sales.controller';
import { CashRegisterController } from './cash-register.controller';

// Services
import { SalesService } from './sales.service';
import { CashRegisterService } from './cash-register.service';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      // Sales entities
      Customer,
      CashRegister,
      CashRegisterSession,
      Sale,
      SaleItem,
      SalePayment,
      // Dependencies
      Product,
      Warehouse,
      InventoryLot,
      InventoryMovement,
      Branch,
      User,
    ]),
  ],
  controllers: [SalesController, CashRegisterController],
  providers: [SalesService, CashRegisterService],
  exports: [SalesService, CashRegisterService],
})
export class SalesModule {}
