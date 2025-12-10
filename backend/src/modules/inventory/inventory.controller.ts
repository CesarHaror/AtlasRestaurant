import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { InventoryService } from './services/inventory.service';
import { WarehousesService } from './services/warehouses.service';
import { AdjustmentsService } from './services/adjustments.service';
import { WasteService } from './services/waste.service';
import { CreateLotDto } from './dto/create-lot.dto';
import { CreateMovementDto } from './dto/create-movement.dto';
import { CreateAdjustmentDto, ApproveAdjustmentDto } from './dto/create-adjustment.dto';
import { CreateWasteDto } from './dto/create-waste.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/create-warehouse.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly warehousesService: WarehousesService,
    private readonly adjustmentsService: AdjustmentsService,
    private readonly wasteService: WasteService,
  ) {}

  // ==================== ALMACENES ====================

  @Post('warehouses')
  @Roles('Admin', 'Gerente')
  @ApiOperation({ summary: 'Crear nuevo almacén' })
  @ApiResponse({ status: 201, description: 'Almacén creado' })
  createWarehouse(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehousesService.create(createWarehouseDto);
  }

  @Get('warehouses')
  @ApiOperation({ summary: 'Listar almacenes' })
  @ApiQuery({ name: 'branchId', required: false, type: Number })
  findAllWarehouses(@Query('branchId') branchId?: number) {
    return this.warehousesService.findAll(branchId);
  }

  @Get('warehouses/:id')
  @ApiOperation({ summary: 'Obtener almacén por ID' })
  findWarehouse(@Param('id', ParseIntPipe) id: number) {
    return this.warehousesService.findOne(id);
  }

  @Post('warehouses/:id/toggle-active')
  @Roles('Admin', 'Gerente')
  @ApiOperation({ summary: 'Alternar estado activo del almacén' })
  toggleWarehouse(@Param('id', ParseIntPipe) id: number) {
    return this.warehousesService.toggleActive(id);
  }

  @Delete('warehouses/:id')
  @Roles('Admin', 'Gerente')
  @ApiOperation({ summary: 'Eliminar (soft delete) almacén' })
  async deleteWarehouse(@Param('id', ParseIntPipe) id: number) {
    await this.warehousesService.remove(id);
    return { success: true };
  }

  @Patch('warehouses/:id')
  @Roles('Admin', 'Gerente')
  @ApiOperation({ summary: 'Actualizar almacén' })
  updateWarehouse(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(id, updateWarehouseDto);
  }

  // ==================== LOTES ====================

  @Post('lots')
  @Roles('Admin', 'Gerente', 'Almacenista')
  @ApiOperation({ summary: 'Crear nuevo lote de inventario' })
  @ApiResponse({ status: 201, description: 'Lote creado' })
  createLot(
    @Body() createLotDto: CreateLotDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.createLot(createLotDto, user.id);
  }

  @Get('lots')
  @ApiOperation({ summary: 'Listar todos los lotes' })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  @ApiQuery({ name: 'warehouseId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAllLots(
    @Query('productId') productId?: number,
    @Query('warehouseId') warehouseId?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.inventoryService.findAllLots({
      productId,
      warehouseId,
      status: status as any,
      search,
    });
  }

  @Get('lots/product/:productId')
  @ApiOperation({ summary: 'Obtener lotes de un producto' })
  @ApiQuery({ name: 'warehouseId', required: false, type: Number })
  findLotsByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('warehouseId') warehouseId?: number,
  ) {
    return this.inventoryService.findLotsByProduct(productId, warehouseId);
  }

  @Get('lots/warehouse/:warehouseId')
  @ApiOperation({ summary: 'Obtener lotes por almacén' })
  findLotsByWarehouse(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
  ) {
    return this.inventoryService.findLotsByWarehouse(warehouseId);
  }

  @Get('lots/:id')
  @ApiOperation({ summary: 'Obtener lote por ID' })
  findLot(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.findLot(id);
  }

  // ==================== STOCK ACTUAL ====================

  @Get('stock/current')
  @ApiOperation({ summary: 'Obtener stock actual general' })
  @ApiResponse({ status: 200, description: 'Stock actual agrupado por producto y almacén' })
  getCurrentStockAll() {
    return this.inventoryService.getStockSummaryAll();
  }

  @Get('stock/product/:productId')
  @ApiOperation({ summary: 'Obtener stock actual de un producto' })
  @ApiQuery({ name: 'warehouseId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Stock actual del producto' })
  getCurrentStock(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('warehouseId') warehouseId?: number,
  ) {
    return this.inventoryService.getCurrentStock(productId, warehouseId);
  }

  @Get('stock/warehouse/:warehouseId')
  @ApiOperation({ summary: 'Obtener stock actual por almacén' })
  @ApiResponse({ status: 200, description: 'Stock actual agrupado por producto en un almacén' })
  getStockByWarehouse(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
  ) {
    return this.inventoryService.getStockByWarehouse(warehouseId);
  }

  // ==================== PRODUCTOS POR VENCER ====================

  @Get('expiring')
  @ApiOperation({ summary: 'Obtener productos próximos a vencer' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Días de anticipación',
    example: 30,
  })
  @ApiQuery({ name: 'warehouseId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de productos por vencer' })
  getExpiringProducts(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
    @Query('warehouseId') warehouseId?: number,
  ) {
    return this.inventoryService.getExpiringProducts(days, warehouseId);
  }

  // ==================== MOVIMIENTOS ====================

  @Post('movements')
  @Roles('Admin', 'Gerente', 'Almacenista')
  @ApiOperation({ summary: 'Registrar movimiento de inventario' })
  @ApiResponse({ status: 201, description: 'Movimiento registrado' })
  createMovement(
    @Body() createMovementDto: CreateMovementDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.createMovement(createMovementDto, user.id);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Obtener todos los movimientos de inventario' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  findAllMovements(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.inventoryService.findAllMovements(startDate, endDate);
  }

  @Get('movements/product/:productId')
  @ApiOperation({ summary: 'Obtener movimientos de un producto' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  findMovementsByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.inventoryService.findMovementsByProduct(
      productId,
      startDate,
      endDate,
    );
  }

  // ==================== AJUSTES ====================

  @Post('adjustments')
  @Roles('Admin', 'Gerente')
  @ApiOperation({ summary: 'Crear ajuste de inventario' })
  @ApiResponse({ status: 201, description: 'Ajuste creado' })
  createAdjustment(
    @Body() createAdjustmentDto: CreateAdjustmentDto,
    @CurrentUser() user: any,
  ) {
    return this.adjustmentsService.create(createAdjustmentDto, user.id);
  }

  @Get('adjustments')
  @ApiOperation({ summary: 'Listar ajustes de inventario' })
  @ApiQuery({ name: 'warehouseId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  findAllAdjustments(
    @Query('warehouseId') warehouseId?: number,
    @Query('status') status?: string,
  ) {
    return this.adjustmentsService.findAll(warehouseId, status as any);
  }

  @Get('adjustments/:id')
  @ApiOperation({ summary: 'Obtener ajuste por ID' })
  findAdjustment(@Param('id', ParseIntPipe) id: number) {
    return this.adjustmentsService.findOne(id);
  }

  @Post('adjustments/:id/approve')
  @Roles('Admin', 'Gerente')
  @ApiOperation({ summary: 'Aprobar ajuste de inventario' })
  approveAdjustment(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveDto: ApproveAdjustmentDto,
    @CurrentUser() user: any,
  ) {
    return this.adjustmentsService.approve(id, approveDto, user.id);
  }

  @Post('adjustments/:id/apply')
  @Roles('Admin', 'Gerente')
  @ApiOperation({ summary: 'Aplicar ajuste de inventario' })
  applyAdjustment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.adjustmentsService.apply(id, user.id);
  }

  // ==================== MERMAS ====================

  @Post('waste')
  @Roles('Admin', 'Gerente', 'Almacenista')
  @ApiOperation({ summary: 'Registrar merma' })
  @ApiResponse({ status: 201, description: 'Merma registrada' })
  createWaste(
    @Body() createWasteDto: CreateWasteDto,
    @CurrentUser() user: any,
  ) {
    return this.wasteService.create(createWasteDto, user.id);
  }

  @Get('waste')
  @ApiOperation({ summary: 'Listar mermas' })
  @ApiQuery({ name: 'warehouseId', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  findAllWaste(
    @Query('warehouseId') warehouseId?: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.wasteService.findAll(warehouseId, startDate, endDate);
  }

  @Get('waste/report')
  @Roles('Admin', 'Gerente')
  @ApiOperation({ summary: 'Reporte de mermas' })
  @ApiQuery({ name: 'startDate', required: true, type: Date })
  @ApiQuery({ name: 'endDate', required: true, type: Date })
  @ApiQuery({ name: 'warehouseId', required: false, type: Number })
  getWasteReport(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('warehouseId') warehouseId?: number,
  ) {
    return this.wasteService.getWasteStats(startDate, endDate, warehouseId);
  }

  @Get('waste/:id')
  @ApiOperation({ summary: 'Obtener merma por ID' })
  findWaste(@Param('id', ParseIntPipe) id: number) {
    return this.wasteService.findOne(id);
  }

  // ==================== TRANSFERENCIAS ====================

  @Post('transfers')
  @Roles('Admin', 'Gerente', 'Almacenista')
  @ApiOperation({ summary: 'Registrar transferencia entre almacenes' })
  @ApiResponse({ status: 201, description: 'Transferencia registrada exitosamente' })
  @ApiResponse({ status: 400, description: 'Validación fallida' })
  createTransfer(
    @Body() createTransferDto: CreateTransferDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.createTransfer(createTransferDto, user.id);
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Listar todas las transferencias' })
  @ApiQuery({ name: 'sourceWarehouseId', required: false, type: Number })
  @ApiQuery({ name: 'destinationWarehouseId', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  findAllTransfers(
    @Query('sourceWarehouseId') sourceWarehouseId?: number,
    @Query('destinationWarehouseId') destinationWarehouseId?: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.inventoryService.findAllTransfers(
      sourceWarehouseId,
      destinationWarehouseId,
      startDate,
      endDate,
    );
  }

  @Get('transfers/product/:productId')
  @ApiOperation({ summary: 'Obtener transferencias de un producto' })
  @ApiParam({ name: 'productId', type: Number })
  findTransfersByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.inventoryService.findTransfersByProduct(productId);
  }
}
