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
import { CashRegisterService } from './cash-register.service';
import { CreateCashRegisterDto } from './dto/create-cash-register.dto';
import { UpdateCashRegisterDto } from './dto/update-cash-register.dto';
import { OpenSessionDto } from './dto/open-session.dto';
import { CloseSessionDto } from './dto/close-session.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface AuthenticatedUser {
  id: string;
  companyId: number;
  branchId: number;
  username: string;
}

@ApiTags('cash-registers')
@Controller('cash-registers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CashRegisterController {
  constructor(private readonly cashRegisterService: CashRegisterService) {}

  // ============================================
  // CRUD CAJAS REGISTRADORAS
  // ============================================

  @Post()
  @Roles('Admin', 'Gerente')
  @ApiOperation({ summary: 'Crear caja registradora' })
  @ApiResponse({ status: 201, description: 'Caja creada exitosamente' })
  @ApiResponse({ status: 409, description: 'El código ya existe' })
  async create(
    @Body() createDto: CreateCashRegisterDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cashRegisterService.createCashRegister(
      createDto,
      user.companyId,
    );
  }

  @Get()
  @Roles('Admin', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Listar cajas registradoras' })
  @ApiResponse({ status: 200, description: 'Lista de cajas' })
  async findAll(@Query('branchId') branchId?: string) {
    return this.cashRegisterService.findAll(branchId ? parseInt(branchId, 10) : undefined);
  }

  @Get(':id')
  @Roles('Admin', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener caja por ID' })
  @ApiResponse({ status: 200, description: 'Caja encontrada' })
  @ApiResponse({ status: 404, description: 'Caja no encontrada' })
  async findOne(@Param('id') id: string) {
    return this.cashRegisterService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'Gerente')
  @ApiOperation({ summary: 'Actualizar caja registradora' })
  @ApiResponse({ status: 200, description: 'Caja actualizada' })
  @ApiResponse({ status: 404, description: 'Caja no encontrada' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateCashRegisterDto) {
    return this.cashRegisterService.update(id, updateDto);
  }

  @Patch(':id/deactivate')
  @Roles('Admin', 'Gerente')
  @ApiOperation({ summary: 'Desactivar caja registradora' })
  @ApiResponse({ status: 200, description: 'Caja desactivada' })
  @ApiResponse({
    status: 400,
    description: 'No se puede desactivar caja con sesión abierta',
  })
  async deactivate(@Param('id') id: string) {
    return this.cashRegisterService.deactivate(id);
  }

  @Get(':id/active-session')
  @Roles('Admin', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener sesión activa de una caja' })
  @ApiResponse({ status: 200, description: 'Sesión activa' })
  @ApiResponse({ status: 404, description: 'No hay sesión activa' })
  async getActiveSession(@Param('id') id: string) {
    return this.cashRegisterService.getActiveSession(id);
  }

  // ============================================
  // GESTIÓN DE SESIONES
  // ============================================

  @Post('sessions/open')
  @Roles('Admin', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Abrir sesión de caja' })
  @ApiResponse({ status: 201, description: 'Sesión abierta exitosamente' })
  @ApiResponse({ status: 409, description: 'Ya existe sesión abierta' })
  async openSession(
    @Body() openDto: OpenSessionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cashRegisterService.openSession(openDto, user.id);
  }

  @Post('sessions/:id/close')
  @Roles('Admin', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Cerrar sesión con arqueo' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  @ApiResponse({ status: 400, description: 'La sesión ya está cerrada' })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  async closeSession(
    @Param('id') id: string,
    @Body() closeDto: CloseSessionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cashRegisterService.closeSession(id, closeDto, user.id);
  }

  @Get('sessions/my-active')
  @Roles('Admin', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener mi sesión activa' })
  @ApiResponse({ status: 200, description: 'Sesión activa del usuario' })
  async getMyActiveSession(@CurrentUser() user: AuthenticatedUser) {
    return this.cashRegisterService.getMyActiveSession(user.id);
  }

  @Get('sessions/all')
  @Roles('Admin', 'Gerente')
  @ApiOperation({ summary: 'Listar sesiones con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de sesiones' })
  async findAllSessions(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
    @Query('status') status?: string,
    @Query('cashRegisterId') cashRegisterId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.cashRegisterService.findAllSessions(
      page,
      limit,
      status,
      cashRegisterId,
      startDate,
      endDate,
    );
  }

  @Get('sessions/:id')
  @Roles('Admin', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener sesión por ID' })
  @ApiResponse({ status: 200, description: 'Sesión encontrada' })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  async findSession(@Param('id') id: string) {
    return this.cashRegisterService.findSession(id);
  }

  @Get('sessions/:id/report')
  @Roles('Admin', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener reporte detallado de sesión' })
  @ApiResponse({ status: 200, description: 'Reporte de sesión' })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  async getSessionReport(@Param('id') id: string) {
    return this.cashRegisterService.getSessionReport(id);
  }
}
