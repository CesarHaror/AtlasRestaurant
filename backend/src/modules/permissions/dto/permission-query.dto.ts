import { IsOptional, IsString } from 'class-validator';

export class PermissionQueryDto {
  @IsOptional()
  @IsString()
  module?: string;
}
