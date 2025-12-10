import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloseSessionDto {
  @ApiProperty({
    example: 1360.0,
    description: 'Efectivo real contado en caja',
  })
  @IsNumber()
  @Min(0, { message: 'El efectivo real debe ser mayor o igual a 0' })
  actualCash: number;

  @ApiProperty({
    example: 'Arqueo correcto, todo cuadró',
    required: false,
    description: 'Notas de cierre',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
