import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleItemDto {
  @ApiProperty({
    example: '1',
    description: 'ID del producto',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    example: 2,
    description: 'Cantidad de unidades',
  })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({
    example: 1.534,
    required: false,
    description: 'Peso en kg (solo para productos pesables)',
  })
  @IsNumber()
  @IsOptional()
  @Min(0.001)
  weight?: number;

  @ApiProperty({
    example: 10,
    required: false,
    description: 'Porcentaje de descuento (0-100)',
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiProperty({
    example: 'Promoción del día',
    required: false,
    description: 'Notas adicionales del item',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
