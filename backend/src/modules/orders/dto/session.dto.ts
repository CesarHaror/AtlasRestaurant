import { IsNumber, IsString } from 'class-validator';

export class OpenSessionDto {
  @IsString()
  registerId: string;

  @IsNumber()
  openingAmount: number;
}

export class CloseSessionDto {
  @IsString()
  sessionId: string;

  @IsNumber()
  closingAmount: number;
}
