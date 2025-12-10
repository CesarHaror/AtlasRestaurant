import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SuppliersController {
  constructor(private readonly svc: SuppliersService) {}

  @Post()
  @Roles('Admin', 'Gerente')
  @ApiOperation({ summary: 'Create a supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created' })
  create(@Body() dto: CreateSupplierDto) {
    return this.svc.create(dto);
  }

  @Get()
  @Roles('Admin', 'Gerente')
  @ApiOperation({ summary: 'List suppliers (paginated)' })
  @ApiResponse({ status: 200, description: 'List of suppliers' })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.svc.findAll(Number(page), Number(limit), search);
  }

  @Get(':id')
  @Roles('Admin', 'Gerente')
  @ApiOperation({ summary: 'Get supplier by id' })
  @ApiResponse({ status: 200, description: 'Supplier' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'Gerente')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('Admin', 'Gerente')
  remove(@Param('id') id: string) {
    return this.svc.softDelete(id);
  }

  @Patch(':id/toggle-active')
  @Roles('Admin', 'Gerente')
  toggle(@Param('id') id: string) {
    return this.svc.toggleActive(id);
  }

  @Post(':id/restore')
  @Roles('Admin', 'Gerente')
  restore(@Param('id') id: string) {
    return this.svc.restore(id);
  }
}
