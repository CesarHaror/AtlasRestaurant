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
}
