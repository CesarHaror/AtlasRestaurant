import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponse } from './dto/auth-response.dto';
export declare class AuthService {
    private userRepository;
    private roleRepository;
    private jwtService;
    private configService;
    private readonly logger;
    private readonly SALT_ROUNDS;
    private MAX_FAILED_ATTEMPTS;
    private LOCK_DURATION_MINUTES;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>, jwtService: JwtService, configService: ConfigService);
    onModuleInit(): void;
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    refreshToken(refreshToken: string): Promise<AuthResponse>;
    logout(userId: string): {
        message: string;
    };
    validateUser(userId: string): Promise<User | null>;
    private generateTokens;
    private generateAuthResponse;
}
