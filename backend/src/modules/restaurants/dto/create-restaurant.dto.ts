import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Mi Restaurante' })
  @IsString()
  @MaxLength(255)
  businessName: string;

  @ApiProperty({ example: 'El Buen Comer', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tradeName?: string;

  @ApiProperty({ example: 'RFC123456', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(13)
  rfc?: string;

  @ApiProperty({ example: 'info@restaurante.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'Av. Siempre Viva 123', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'CDMX', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Mexico', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '01000', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: '+52 55 1234 5678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
