import { IsNotEmpty, IsNumber, IsPositive, Min, IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferDto {
  @IsNotEmpty({ message: 'El almacén origen es requerido' })
  @IsNumber({}, { message: 'El almacén origen debe ser un número' })
  @IsPositive({ message: 'El almacén origen debe ser positivo' })
  @ApiProperty({ example: 1, description: 'ID del almacén origen' })
  sourceWarehouseId: number;

  @IsNotEmpty({ message: 'El almacén destino es requerido' })
  @IsNumber({}, { message: 'El almacén destino debe ser un número' })
  @IsPositive({ message: 'El almacén destino debe ser positivo' })
  @ApiProperty({ example: 2, description: 'ID del almacén destino' })
  destinationWarehouseId: number;

  @IsNotEmpty({ message: 'El producto es requerido' })
  @IsNumber({}, { message: 'El producto debe ser un número' })
  @IsPositive({ message: 'El producto debe ser positivo' })
  @ApiProperty({ example: 5, description: 'ID del producto a transferir' })
  productId: number;

  @IsNotEmpty({ message: 'El lote es requerido' })
  @IsUUID('4', { message: 'El lote debe ser un UUID válido' })
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', description: 'ID del lote a transferir' })
  lotId: string;

  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @IsPositive({ message: 'La cantidad debe ser positiva' })
  @Min(0.01, { message: 'La cantidad debe ser mayor a 0' })
  @ApiProperty({ example: 50, description: 'Cantidad a transferir' })
  quantity: number;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto' })
  @ApiProperty({
    example: 'Transferencia de stock entre almacenes',
    description: 'Observaciones o notas sobre la transferencia',
    required: false,
  })
  notes?: string;
}
