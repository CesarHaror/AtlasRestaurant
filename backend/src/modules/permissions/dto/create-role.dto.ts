import { IsNotEmpty, IsString, IsArray, IsUUID, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
