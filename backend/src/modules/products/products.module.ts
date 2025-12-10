import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductCategory } from './entities/product-category.entity';
import { UnitOfMeasure } from './entities/unit-of-measure.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoriesController } from './categories.controller';
import { UnitsOfMeasureController } from './units-of-measure.controller';
import { FileUploadService } from '../../common/services/file-upload.service';
import { Inventory } from '../inventory/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductCategory, UnitOfMeasure, Inventory])],
  providers: [ProductsService, FileUploadService],
  controllers: [ProductsController, CategoriesController, UnitsOfMeasureController],
  exports: [ProductsService],
})
export class ProductsModule {}
