import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly svc: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.svc.create(dto);
  }

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '50') {
    return this.svc.findAll(Number(page), Number(limit));
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.svc.search(q || '');
  }

  @Get('low-stock')
  lowStock(@Query('reorderLevel') rl: string) {
    return this.svc.lowStock(rl ? Number(rl) : undefined);
  }

  @Get('sku/:sku')
  bySku(@Param('sku') sku: string) {
    return this.svc.findBySku(sku);
  }

  @Get('barcode/:barcode')
  byBarcode(@Param('barcode') barcode: string) {
    return this.svc.findByBarcode(barcode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.svc.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.softDelete(Number(id));
  }

  @Patch(':id/toggle-active')
  toggle(@Param('id') id: string) {
    return this.svc.toggleActive(Number(id));
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.svc.restore(Number(id));
  }
}
