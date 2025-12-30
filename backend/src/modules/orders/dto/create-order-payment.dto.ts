import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  CREDIT = 'CREDIT',
}

export enum CardType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export class CreateOrderPaymentDto {
  @ApiProperty({
    example: 'CASH',
    enum: PaymentMethod,
    description: 'Método de pago',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    example: 360.0,
    description: 'Monto del pago',
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    example: 'REF123456',
    required: false,
    description: 'Referencia del pago (para transferencias)',
  })
  @IsString()
  @IsOptional()
  paymentReference?: string;

  @ApiProperty({
    example: '4242',
    required: false,
    description: 'Últimos 4 dígitos de la tarjeta',
  })
  @IsString()
  @IsOptional()
  cardLastDigits?: string;

  @ApiProperty({
    example: 'CREDIT',
    enum: CardType,
    required: false,
    description: 'Tipo de tarjeta',
  })
  @IsEnum(CardType)
  @IsOptional()
  cardType?: CardType;
}
