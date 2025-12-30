// (removed duplicate minimal controller; keeping guarded controller below)
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface AuthenticatedUser {
  id: string;
  companyId: number;
  branchId: number;
}

@ApiTags('sales')
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly salesService: OrdersService) {}

  @Post()
  @Roles('Admin', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Crear una venta' })
  @ApiResponse({ status: 201, description: 'Venta creada exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o stock insuficiente',
  })
  async create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: any) {
    return this.salesService.create(
      createOrderDto,
      user.companyId,
      user.branchId,
      user.id,
    );
  }

  @Get()
  @Roles('Admin', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Listar ventas' })
  @ApiResponse({ status: 200, description: 'Lista de ventas' })
  async findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.salesService.findAll(page, limit, startDate, endDate, status);
  }

  @Get(':id')
  @Roles('Admin', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener una venta por ID' })
  @ApiResponse({ status: 200, description: 'Venta encontrada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(':id/cancel')
  @Roles('Admin', 'Gerente')
  @ApiOperation({ summary: 'Cancelar una venta' })
  @ApiResponse({ status: 200, description: 'Venta cancelada exitosamente' })
  @ApiResponse({ status: 400, description: 'La venta ya está cancelada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.salesService.cancel(id, user.companyId, user.id);
  }
}
