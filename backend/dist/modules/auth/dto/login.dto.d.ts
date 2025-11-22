import { ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
export declare class UsernameOrEmailConstraint implements ValidatorConstraintInterface {
    validate(_value: unknown, args: ValidationArguments): boolean;
    defaultMessage(): string;
}
export declare class LoginDto {
    username?: string;
    email?: string;
    password: string;
}
