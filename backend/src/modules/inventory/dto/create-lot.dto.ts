import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  IsOptional,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateLotDto {
  @ApiProperty({
    example: 1,
    description: 'ID del producto',
  })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({
    example: 1,
    description: 'ID del almacén',
  })
  @IsNumber()
  @IsNotEmpty()
  warehouseId: number;

  @ApiProperty({
    example: 'LOT-2024-001',
    description: 'Número de lote del proveedor',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lotNumber: string;

  @ApiProperty({
    example: 100.5,
    description: 'Cantidad inicial',
  })
  @IsNumber()
  @Min(0.001)
  @IsNotEmpty()
  initialQuantity: number;

  @ApiProperty({
    example: 150.75,
    description: 'Costo unitario',
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  unitCost: number;

  @ApiPropertyOptional({
    example: '2024-01-15',
    description: 'Fecha de producción',
  })
  @IsDateString()
  @IsOptional()
  productionDate?: string;

  @ApiPropertyOptional({
    example: '2024-06-15',
    description: 'Fecha de vencimiento',
  })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateLotDto extends PartialType(CreateLotDto) {}
