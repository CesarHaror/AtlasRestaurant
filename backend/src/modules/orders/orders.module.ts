import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Order entities
import { Customer } from './entities/customer.entity';
import { CashRegister } from './entities/cash-register.entity';
import { CashRegisterSession } from './entities/cash-register-session.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderPayment } from './entities/order-payment.entity';

// Dependencies - Other modules
import { MenuItem } from '../menu/entities/menu-item.entity';
import { Warehouse } from '../inventory/entities/warehouse.entity';
import { InventoryLot } from '../inventory/entities/inventory-lot.entity';
import { InventoryMovement } from '../inventory/entities/inventory-movement.entity';
import { Branch } from '../branches/entities/branch.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

// Controllers
import { OrdersController } from './orders.controller';
import { CashRegisterController } from './cash-register.controller';

// Services
import { OrdersService } from './orders.service';
import { CashRegisterService } from './cash-register.service';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      // Order entities
      Customer,
      CashRegister,
      CashRegisterSession,
      Order,
      OrderItem,
      OrderPayment,
      // Dependencies
      MenuItem,
      Warehouse,
      InventoryLot,
      InventoryMovement,
      Branch,
      User,
    ]),
  ],
  controllers: [OrdersController, CashRegisterController],
  providers: [OrdersService, CashRegisterService],
  exports: [OrdersService, CashRegisterService],
})
export class OrdersModule {}
