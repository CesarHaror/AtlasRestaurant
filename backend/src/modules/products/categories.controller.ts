import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FileUploadService } from '../../common/services/file-upload.service';
import { ProductCategory } from './entities/product-category.entity';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  private readonly logger = new Logger('CategoriesController');

  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepo: Repository<ProductCategory>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  async findAll() {
    return this.categoryRepo.find({
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener categoría por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryRepo.findOne({ where: { id } });
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva categoría' })
  async create(@Body() dto: any) {
    this.logger.log(`Creating category: ${JSON.stringify(dto)}`);
    
    // Procesar imágenes Base64 si existen
    if (dto.imageUrl && typeof dto.imageUrl === 'string' && dto.imageUrl.startsWith('data:')) {
      this.logger.log('Processing imageUrl Base64');
      dto.imageUrl = this.fileUploadService.saveBase64Image(
        dto.imageUrl,
        `category-${Date.now()}-image`,
      );
    }
    
    if (dto.thumbnailUrl && typeof dto.thumbnailUrl === 'string' && dto.thumbnailUrl.startsWith('data:')) {
      this.logger.log('Processing thumbnailUrl Base64');
      dto.thumbnailUrl = this.fileUploadService.saveBase64Image(
        dto.thumbnailUrl,
        `category-${Date.now()}-thumb`,
      );
    }
    
    const category = this.categoryRepo.create(dto);
    const saved = await this.categoryRepo.save(category);
    this.logger.log(`Category created: ${JSON.stringify(saved)}`);
    return saved;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar categoría' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    this.logger.log(`Updating category ${id}`);
    
    // Obtener categoría actual para eliminar imágenes antiguas si es necesario
    const existing = await this.categoryRepo.findOne({ where: { id } });
    
    // Procesar imágenes Base64 si existen
    if (dto.imageUrl && typeof dto.imageUrl === 'string' && dto.imageUrl.startsWith('data:')) {
      this.logger.log('Processing imageUrl Base64 for update');
      if (existing?.imageUrl && !existing.imageUrl.startsWith('data:')) {
        this.fileUploadService.deleteImage(existing.imageUrl);
      }
      dto.imageUrl = this.fileUploadService.saveBase64Image(
        dto.imageUrl,
        `category-${Date.now()}-image`,
      );
    }
    
    if (dto.thumbnailUrl && typeof dto.thumbnailUrl === 'string' && dto.thumbnailUrl.startsWith('data:')) {
      this.logger.log('Processing thumbnailUrl Base64 for update');
      if (existing?.thumbnailUrl && !existing.thumbnailUrl.startsWith('data:')) {
        this.fileUploadService.deleteImage(existing.thumbnailUrl);
      }
      dto.thumbnailUrl = this.fileUploadService.saveBase64Image(
        dto.thumbnailUrl,
        `category-${Date.now()}-thumb`,
      );
    }
    
    await this.categoryRepo.update(id, dto);
    const updated = await this.categoryRepo.findOne({ where: { id } });
    this.logger.log(`Category updated successfully: ${JSON.stringify(updated)}`);
    return updated;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar categoría' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    
    // Eliminar imágenes asociadas
    if (category?.imageUrl && !category.imageUrl.startsWith('data:')) {
      this.fileUploadService.deleteImage(category.imageUrl);
    }
    if (category?.thumbnailUrl && !category.thumbnailUrl.startsWith('data:')) {
      this.fileUploadService.deleteImage(category.thumbnailUrl);
    }
    
    await this.categoryRepo.delete(id);
    return { success: true };
  }
}
