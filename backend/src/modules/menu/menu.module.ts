import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { MenuCategory } from './entities/menu-category.entity';
import { UnitOfMeasure } from './entities/unit-of-measure.entity';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { CategoriesController } from './categories.controller';
import { UnitsOfMeasureController } from './units-of-measure.controller';
import { FileUploadService } from '../../common/services/file-upload.service';
import { Inventory } from '../inventory/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem, MenuCategory, UnitOfMeasure, Inventory])],
  providers: [MenuService, FileUploadService],
  controllers: [MenuController, CategoriesController, UnitsOfMeasureController],
  exports: [MenuService],
})
export class MenuModule {}
