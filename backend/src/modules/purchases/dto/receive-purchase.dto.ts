import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min, ValidateNested } from 'class-validator';

class ReceivePurchaseItemInput {
  @IsInt()
  purchaseItemId: number;

  @IsNumber()
  @Min(0.0001)
  quantityReceived: number;

  @IsString()
  @Length(1, 64)
  lotNumber: string;

  @IsOptional()
  @IsDateString()
  productionDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReceivePurchaseDto {
  @IsDateString()
  receivedDate: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceivePurchaseItemInput)
  items: ReceivePurchaseItemInput[];
}