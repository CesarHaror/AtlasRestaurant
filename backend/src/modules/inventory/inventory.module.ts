import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { InventoryController } from './inventory.controller';

// Services
import { InventoryService } from './services/inventory.service';
import { WarehousesService } from './services/warehouses.service';
import { AdjustmentsService } from './services/adjustments.service';
import { WasteService } from './services/waste.service';

// Entities
import { Warehouse } from './entities/warehouse.entity';
import { InventoryLot } from './entities/inventory-lot.entity';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { InventoryAdjustment } from './entities/inventory-adjustment.entity';
import { AdjustmentItem } from './entities/adjustment-item.entity';
import { WasteRecord } from './entities/waste-record.entity';
import { InventoryTransfer } from './entities/inventory-transfer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Warehouse,
      InventoryLot,
      InventoryMovement,
      InventoryAdjustment,
      AdjustmentItem,
      WasteRecord,
      InventoryTransfer,
    ]),
  ],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    WarehousesService,
    AdjustmentsService,
    WasteService,
  ],
  exports: [
    InventoryService,
    WarehousesService,
    AdjustmentsService,
    WasteService,
  ],
})
export class InventoryModule {}
