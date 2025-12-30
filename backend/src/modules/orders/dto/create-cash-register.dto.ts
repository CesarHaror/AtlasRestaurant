import {
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCashRegisterDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la sucursal',
  })
  @IsNumber()
  branchId: number;

  @ApiProperty({
    example: 'CAJA01',
    description: 'Código único de la caja',
  })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: 'Caja Principal',
    description: 'Nombre descriptivo de la caja',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: true,
    description: 'Indica si la caja tiene báscula integrada',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  hasScale?: boolean;

  @ApiProperty({
    example: 'COM3',
    required: false,
    description: 'Puerto de la báscula',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  scalePort?: string;

  @ApiProperty({
    example: 'PC-CAJA01',
    required: false,
    description: 'Identificador del dispositivo',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  deviceIdentifier?: string;
}
