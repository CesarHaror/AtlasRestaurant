import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEmail,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'UsernameOrEmail', async: false })
export class UsernameOrEmailConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments) {
    const obj = args.object as Record<string, unknown> | undefined;
    if (!obj) return false;
    const username = obj['username'];
    const email = obj['email'];
    const hasUsername =
      typeof username === 'string' && username.trim().length > 0;
    const hasEmail = typeof email === 'string' && email.trim().length > 0;
    return hasUsername || hasEmail;
  }
  defaultMessage(): string {
    return 'Debe proporcionar nombre de usuario o email.';
  }
}

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Nombre de usuario',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    example: 'devadmin@example.com',
    description: 'Email del usuario',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contraseña del usuario',
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;
}
