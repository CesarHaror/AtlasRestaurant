import { IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OpenSessionDto {
  @ApiProperty({
    example: 'uuid-de-caja',
    description: 'ID de la caja registradora',
  })
  @IsUUID()
  cashRegisterId: string;

  @ApiProperty({
    example: 500.0,
    description: 'Efectivo inicial en caja (fondo)',
  })
  @IsNumber()
  @Min(0, { message: 'El efectivo inicial debe ser mayor o igual a 0' })
  openingCash: number;

  @ApiProperty({
    example: 'Turno matutino - Lunes',
    required: false,
    description: 'Notas de apertura',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
