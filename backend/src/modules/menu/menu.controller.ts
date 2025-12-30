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
  Logger,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

interface AuthenticatedUser {
  id: string;
  companyId: number;
  branchId: number;
  username: string;
}

@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  private logger = new Logger('MenuController');

  constructor(private readonly svc: MenuService) {}

  @Post()
  create(@Body() dto: CreateMenuItemDto) {
    this.logger.log(`Creating product: ${dto.name}, imageUrl: ${dto.imageUrl ? 'YES' : 'NO'}, thumbnailUrl: ${dto.thumbnailUrl ? 'YES' : 'NO'}`);
    // TODO: Add company_id relation to users table or extract from context
    const companyId = 1; // Hardcoded for now
    return this.svc.create(dto, companyId);
  }

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: string,
  ) {
    // TODO: Add company_id relation to users table or extract from context
    const companyId = 1; // Hardcoded for now
    return this.svc.findAll(
      Number(page),
      Number(limit),
      companyId,
      {
        search: search || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        isActive: typeof isActive !== 'undefined' ? isActive === 'true' : undefined,
      },
    );
  }

  @Get('for-pos/available')
  forPOS(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    // Endpoint específico para POS - solo productos activos y habilitados para POS
    const companyId = 1; // Hardcoded for now
    return this.svc.findAll(
      Number(page),
      Number(limit),
      companyId,
      {
        search: search || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        isActive: true, // Solo activos
        showInPos: true, // Solo habilitados para POS
      },
    );
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
  update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    this.logger.log(`Updating product ${id}: ${dto.name || 'unknown'}, imageUrl: ${dto.imageUrl ? 'YES' : 'NO'}, thumbnailUrl: ${dto.thumbnailUrl ? 'YES' : 'NO'}`);
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

  @Patch(':id/toggle-pos-visibility')
  togglePosVisibility(@Param('id') id: string) {
    return this.svc.togglePosVisibility(Number(id));
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.svc.restore(Number(id));
  }
}
