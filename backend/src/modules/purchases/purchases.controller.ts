import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { ReceivePurchaseDto } from './dto/receive-purchase.dto';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Controller('purchases')
export class PurchasesController {
  constructor(private purchases: PurchasesService, private suppliers: SuppliersService) {}

  @Post()
  create(@Body() dto: CreatePurchaseDto) {
    return this.purchases.create(dto);
  }

  @Get()
  list(@Query('page') page = 1, @Query('limit') limit = 20, @Query('status') status?: string, @Query('supplierId') supplierId?: number) {
    return this.purchases.list(Number(page), Number(limit), status, supplierId ? Number(supplierId) : undefined);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.purchases.approve(Number(id));
  }

  @Post(':id/receive')
  receive(@Param('id') id: string, @Body() dto: ReceivePurchaseDto) {
    // TODO: replace hardcoded userId with authenticated user context
    return this.purchases.receive(Number(id), dto, 0);
  }

  @Post('suppliers')
  createSupplier(@Body() dto: CreateSupplierDto) {
    return this.suppliers.create(dto);
  }

  @Get('suppliers')
  listSuppliers(@Query('q') q?: string, @Query('limit') limit = 20) {
    return this.suppliers.findAll(q, Number(limit));
  }

  @Get('suppliers/search')
  searchSuppliers(@Query('q') q?: string, @Query('limit') limit = 10) {
    return this.suppliers.findAll(q, Number(limit));
  }

  @Get('supplier/:supplierId')
  purchasesBySupplier(@Param('supplierId') supplierId: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.purchases.list(Number(page), Number(limit), undefined, Number(supplierId));
  }

  @Patch('suppliers/:id')
  updateSupplier(@Param('id') id: string, @Body() dto: CreateSupplierDto) {
    return this.suppliers.update(Number(id), dto);
  }
}