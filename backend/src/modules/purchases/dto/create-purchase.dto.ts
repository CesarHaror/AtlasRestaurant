import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min, ValidateNested } from 'class-validator';

class CreatePurchaseItemInput {
  @IsInt()
  productId: number;

  @IsNumber()
  @Min(0.0001)
  quantityOrdered: number;

  @IsNumber()
  @Min(0)
  unitCost: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  discountPercentage?: number;
}

export class CreatePurchaseDto {
  @IsInt()
  branchId: number;

  @IsInt()
  warehouseId: number;

  @IsInt()
  supplierId: number;

  @IsDateString()
  orderDate: string;

  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  supplierInvoice?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  paymentTerms?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemInput)
  items: CreatePurchaseItemInput[];
}