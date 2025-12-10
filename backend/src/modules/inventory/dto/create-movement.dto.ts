import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '../entities/inventory-movement.entity';

export class CreateMovementDto {
  @ApiProperty({
    enum: MovementType,
    example: MovementType.PURCHASE,
    description: 'Tipo de movimiento',
  })
  @IsEnum(MovementType)
  @IsNotEmpty()
  movementType: MovementType;

  @ApiPropertyOptional({
    example: 'Purchase',
    description: 'Tipo de referencia (Purchase, Sale, etc.)',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  referenceType?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID de la referencia',
  })
  @IsNumber()
  @IsOptional()
  referenceId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID del producto',
  })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiPropertyOptional({
    example: 'uuid-of-lot',
    description: 'ID del lote',
  })
  @IsUUID()
  @IsOptional()
  lotId?: string;

  @ApiProperty({
    example: 1,
    description: 'ID del almacén',
  })
  @IsNumber()
  @IsNotEmpty()
  warehouseId: number;

  @ApiProperty({
    example: 50.0,
    description: 'Cantidad (positivo para entrada, negativo para salida)',
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiPropertyOptional({
    example: 150.75,
    description: 'Costo unitario',
  })
  @IsNumber()
  @IsOptional()
  unitCost?: number;

  @ApiPropertyOptional({
    description: 'Notas adicionales',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
