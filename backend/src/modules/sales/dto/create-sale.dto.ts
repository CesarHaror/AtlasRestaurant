// (removed duplicate minimal DTO; keeping the Swagger-validated version used by services)
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSaleItemDto } from './create-sale-item.dto';
import { CreateSalePaymentDto } from './create-sale-payment.dto';

export enum SaleType {
  RETAIL = 'RETAIL',
  WHOLESALE = 'WHOLESALE',
  CREDIT = 'CREDIT',
}

export class CreateSaleDto {
  @ApiProperty({
    example: 'uuid-del-cliente',
    required: false,
    description:
      'ID del cliente (opcional, usar "público general" si no se especifica)',
  })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiProperty({
    example: 'uuid-de-la-caja',
    description: 'ID de la caja registradora',
  })
  @IsUUID()
  cashRegisterId: string;

  @ApiProperty({
    example: 'uuid-de-la-sesion',
    description: 'ID de la sesión de caja activa',
  })
  @IsUUID()
  sessionId: string;

  @ApiProperty({
    type: [CreateSaleItemDto],
    description: 'Items a vender',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe haber al menos 1 producto' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @ApiProperty({
    type: [CreateSalePaymentDto],
    description: 'Métodos de pago',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe haber al menos 1 método de pago' })
  @ValidateNested({ each: true })
  @Type(() => CreateSalePaymentDto)
  payments: CreateSalePaymentDto[];

  @ApiProperty({
    example: 'RETAIL',
    enum: SaleType,
    description: 'Tipo de venta',
    default: 'RETAIL',
  })
  @IsEnum(SaleType)
  @IsOptional()
  saleType?: SaleType;

  @ApiProperty({
    example: 'Cliente solicitó factura',
    required: false,
    description: 'Notas adicionales de la venta',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
