import {
  IsString,
  IsOptional,
  MaxLength,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Bife de res' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Corte de res premium', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'SKU123', required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: '0123456789012', required: false })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: 12.5, required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  showInPos?: boolean;

  // Extended fields to match entity and frontend
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  unitOfMeasureId?: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isVariableWeight?: boolean;

  @ApiProperty({ example: 'SIMPLE', required: false })
  @IsOptional()
  @IsString()
  productType?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  trackLots?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  trackExpiry?: boolean;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  minStockAlert?: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  maxStock?: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  requiresRefrigeration?: boolean;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  minTemperature?: number;

  @ApiProperty({ example: 8, required: false })
  @IsOptional()
  @IsNumber()
  maxTemperature?: number;

  @ApiProperty({ example: 10.5, required: false })
  @IsOptional()
  @IsNumber()
  standardCost?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  primarySupplierId?: number;

  @ApiProperty({ example: '10101500', required: false })
  @IsOptional()
  @IsString()
  satProductKey?: string;

  @ApiProperty({ example: 'H87', required: false })
  @IsOptional()
  @IsString()
  satUnitKey?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 'https://example.com/thumb.jpg', required: false })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}
