import { IsString, IsOptional, MaxLength, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  companyId: number;

  @ApiProperty({ example: 'Sucursal Centro' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Calle falsa 123', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '999888777', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
