import {
  IsString,
  IsOptional,
  IsEmail,
  IsNumber,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';

export enum CustomerType {
  RETAIL = 'RETAIL',
  WHOLESALE = 'WHOLESALE',
  CREDIT = 'CREDIT',
}

export class CreateCustomerDto {
  @IsOptional()
  @IsNumber()
  company?: number;

  @IsOptional()
  @IsEnum(CustomerType)
  customerType?: CustomerType;

  @IsString()
  @MaxLength(50)
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  businessName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  rfc?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentBalance?: number;
}
