import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WasteType } from '../entities/waste-record.entity';

export class CreateWasteDto {
  @ApiProperty({
    example: 1,
    description: 'ID del almacén',
  })
  @IsNumber()
  @IsNotEmpty()
  warehouseId: number;

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
    enum: WasteType,
    example: WasteType.EXPIRY,
    description: 'Tipo de merma',
  })
  @IsEnum(WasteType)
  @IsNotEmpty()
  wasteType: WasteType;

  @ApiProperty({
    example: 5.5,
    description: 'Cantidad de merma',
  })
  @IsNumber()
  @Min(0.001)
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    example: 150.75,
    description: 'Costo unitario',
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  unitCost: number;

  @ApiProperty({
    example: 'Producto vencido encontrado en cámara fría',
    description: 'Razón de la merma',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    example: 'uuid-of-user',
    description: 'ID del usuario responsable',
  })
  @IsUUID()
  @IsOptional()
  responsibleUserId?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/evidence.jpg',
    description: 'URL de la foto de evidencia',
  })
  @IsUrl()
  @IsOptional()
  photoUrl?: string;
}
