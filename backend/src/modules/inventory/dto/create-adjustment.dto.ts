import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AdjustmentType } from '../entities/inventory-adjustment.entity';

export class CreateAdjustmentItemDto {
  @ApiProperty({
    example: 1,
    description: 'ID del producto',
  })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({
    example: 'uuid-of-lot',
    description: 'ID del lote',
  })
  @IsUUID()
  @IsNotEmpty()
  lotId: string;

  @ApiProperty({
    example: 100.0,
    description: 'Cantidad en sistema',
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  systemQuantity: number;

  @ApiProperty({
    example: 95.0,
    description: 'Cantidad física contada',
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  physicalQuantity: number;

  @ApiProperty({
    example: 150.75,
    description: 'Costo unitario',
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  unitCost: number;

  @ApiPropertyOptional({
    example: 'Diferencia encontrada en conteo físico',
    description: 'Razón del ajuste',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class CreateAdjustmentDto {
  @ApiProperty({
    example: 1,
    description: 'ID del almacén',
  })
  @IsNumber()
  @IsNotEmpty()
  warehouseId: number;

  @ApiProperty({
    enum: AdjustmentType,
    example: AdjustmentType.PHYSICAL_COUNT,
    description: 'Tipo de ajuste',
  })
  @IsEnum(AdjustmentType)
  @IsNotEmpty()
  adjustmentType: AdjustmentType;

  @ApiPropertyOptional({
    description: 'Notas del ajuste',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    type: [CreateAdjustmentItemDto],
    description: 'Items del ajuste',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateAdjustmentItemDto)
  items: CreateAdjustmentItemDto[];
}

export class ApproveAdjustmentDto {
  @ApiPropertyOptional({
    description: 'Notas de aprobación',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
