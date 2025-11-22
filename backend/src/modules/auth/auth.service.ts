import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponse } from './dto/auth-response.dto';

interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 12;
  private MAX_FAILED_ATTEMPTS: number;
  private LOCK_DURATION_MINUTES: number;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Initialize configurable thresholds after construction
  onModuleInit() {
    const maxAttempts = this.configService.get<number>('MAX_FAILED_ATTEMPTS');
    const lockMinutes = this.configService.get<number>('LOCK_DURATION_MINUTES');

    this.MAX_FAILED_ATTEMPTS =
      Number.isInteger(maxAttempts) && maxAttempts! > 0 ? maxAttempts! : 5;
    this.LOCK_DURATION_MINUTES =
      Number.isInteger(lockMinutes) && lockMinutes! > 0 ? lockMinutes! : 30;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findOne({
      where: [{ username: registerDto.username }, { email: registerDto.email }],
    });

    if (existingUser) {
      throw new ConflictException('El usuario o email ya existe');
    }

    const passwordHash = await bcrypt.hash(
      registerDto.password,
      this.SALT_ROUNDS,
    );

    const user = this.userRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phone: registerDto.phone,
      isActive: true,
      failedLoginAttempts: 0,
    } as Partial<User>);

    const savedUser = await this.userRepository.save(user);

    return this.generateAuthResponse(savedUser);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Require either username o email
    if (!loginDto.username && !loginDto.email) {
      throw new BadRequestException('Nombre de usuario o email es requerido');
    }

    const whereConditions: Array<Partial<User>> = [];
    if (loginDto.username)
      whereConditions.push({ username: loginDto.username });
    if (loginDto.email) whereConditions.push({ email: loginDto.email });

    const user = await this.userRepository.findOne({
      where: whereConditions,
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (
      user.lockedUntil &&
      typeof user.lockedUntil !== 'string' &&
      new Date() < user.lockedUntil
    ) {
      throw new UnauthorizedException('Cuenta bloqueada temporalmente');
    }

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatch) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= this.MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(
          Date.now() + this.LOCK_DURATION_MINUTES * 60 * 1000,
        );
      }

      await this.userRepository.save(user);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLogin = new Date();

    await this.userRepository.save(user);

    return this.generateAuthResponse(user);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const passwordMatch = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!passwordMatch) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    user.passwordHash = await bcrypt.hash(
      changePasswordDto.newPassword,
      this.SALT_ROUNDS,
    );
    await this.userRepository.save(user);

    return { message: 'Contraseña cambiada exitosamente' };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('JWT_SECRET') ||
          'tu_secreto_development',
      }) as unknown;

      if (
        typeof payload !== 'object' ||
        payload === null ||
        !('sub' in payload)
      ) {
        throw new UnauthorizedException('Token inválido o expirado');
      }

      const userId = String((payload as Record<string, unknown>)['sub']);

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles', 'roles.permissions'],
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return this.generateAuthResponse(user);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  logout(userId: string): { message: string } {
    this.logger.log(`Usuario ${userId} ha cerrado sesión`);
    return { message: 'Sesión cerrada exitosamente' };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });
  }

  private generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles?.map((r) => r.name) || [],
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return { accessToken, refreshToken };
  }

  private generateAuthResponse(user: User): AuthResponse {
    const { accessToken, refreshToken } = this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles?.map((r) => ({ id: r.id, name: r.name })) || [],
      },
    };
  }
}
