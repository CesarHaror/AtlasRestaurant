import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsUUID,
  IsOptional,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { WarehouseType } from '../entities/warehouse.entity';

export class CreateWarehouseDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la sucursal',
  })
  @IsNumber()
  @IsNotEmpty()
  branchId: number;

  @ApiProperty({
    example: 'ALM-001',
    description: 'Código único del almacén',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Transform(({ value }) => value?.trim().toUpperCase())
  code: string;

  @ApiProperty({
    example: 'Cámara Fría Principal',
    description: 'Nombre del almacén',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    enum: WarehouseType,
    example: WarehouseType.COLD_STORAGE,
    description: 'Tipo de almacén',
  })
  @IsEnum(WarehouseType)
  @IsNotEmpty()
  warehouseType: WarehouseType;

  @ApiPropertyOptional({
    default: false,
    description: '¿Tiene control de temperatura?',
  })
  @IsBoolean()
  @IsOptional()
  hasTemperatureControl?: boolean;

  @ApiPropertyOptional({
    example: 4,
    description: 'Temperatura objetivo en °C',
  })
  @IsNumber()
  @Min(-50)
  @Max(50)
  @IsOptional()
  targetTemperature?: number;

  @ApiPropertyOptional({
    default: true,
    description: '¿El almacén está activo?',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {}
