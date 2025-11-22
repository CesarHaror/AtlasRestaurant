import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Mi Empresa' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: '20512345678', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(11)
  ruc?: string;

  @ApiProperty({ example: 'Av. Siempre Viva 123', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '999888777', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
