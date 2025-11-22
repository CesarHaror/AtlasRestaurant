"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../users/entities/user.entity");
const role_entity_1 = require("../users/entities/role.entity");
let AuthService = AuthService_1 = class AuthService {
    userRepository;
    roleRepository;
    jwtService;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    SALT_ROUNDS = 12;
    MAX_FAILED_ATTEMPTS;
    LOCK_DURATION_MINUTES;
    constructor(userRepository, roleRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    onModuleInit() {
        const maxAttempts = this.configService.get('MAX_FAILED_ATTEMPTS');
        const lockMinutes = this.configService.get('LOCK_DURATION_MINUTES');
        this.MAX_FAILED_ATTEMPTS =
            Number.isInteger(maxAttempts) && maxAttempts > 0 ? maxAttempts : 5;
        this.LOCK_DURATION_MINUTES =
            Number.isInteger(lockMinutes) && lockMinutes > 0 ? lockMinutes : 30;
    }
    async register(registerDto) {
        const existingUser = await this.userRepository.findOne({
            where: [{ username: registerDto.username }, { email: registerDto.email }],
        });
        if (existingUser) {
            throw new common_1.ConflictException('El usuario o email ya existe');
        }
        const passwordHash = await bcrypt.hash(registerDto.password, this.SALT_ROUNDS);
        const user = this.userRepository.create({
            username: registerDto.username,
            email: registerDto.email,
            passwordHash,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            phone: registerDto.phone,
            isActive: true,
            failedLoginAttempts: 0,
        });
        const savedUser = await this.userRepository.save(user);
        return this.generateAuthResponse(savedUser);
    }
    async login(loginDto) {
        if (!loginDto.username && !loginDto.email) {
            throw new common_1.BadRequestException('Nombre de usuario o email es requerido');
        }
        const whereConditions = [];
        if (loginDto.username)
            whereConditions.push({ username: loginDto.username });
        if (loginDto.email)
            whereConditions.push({ email: loginDto.email });
        const user = await this.userRepository.findOne({
            where: whereConditions,
            relations: ['roles', 'roles.permissions'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        if (user.lockedUntil &&
            typeof user.lockedUntil !== 'string' &&
            new Date() < user.lockedUntil) {
            throw new common_1.UnauthorizedException('Cuenta bloqueada temporalmente');
        }
        const passwordMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!passwordMatch) {
            user.failedLoginAttempts += 1;
            if (user.failedLoginAttempts >= this.MAX_FAILED_ATTEMPTS) {
                user.lockedUntil = new Date(Date.now() + this.LOCK_DURATION_MINUTES * 60 * 1000);
            }
            await this.userRepository.save(user);
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        user.failedLoginAttempts = 0;
        user.lockedUntil = undefined;
        user.lastLogin = new Date();
        await this.userRepository.save(user);
        return this.generateAuthResponse(user);
    }
    async changePassword(userId, changePasswordDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        const passwordMatch = await bcrypt.compare(changePasswordDto.currentPassword, user.passwordHash);
        if (!passwordMatch) {
            throw new common_1.BadRequestException('Contraseña actual incorrecta');
        }
        user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, this.SALT_ROUNDS);
        await this.userRepository.save(user);
        return { message: 'Contraseña cambiada exitosamente' };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_SECRET') ||
                    'tu_secreto_development',
            });
            if (typeof payload !== 'object' ||
                payload === null ||
                !('sub' in payload)) {
                throw new common_1.UnauthorizedException('Token inválido o expirado');
            }
            const userId = String(payload['sub']);
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['roles', 'roles.permissions'],
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Usuario no encontrado');
            }
            return this.generateAuthResponse(user);
        }
        catch {
            throw new common_1.UnauthorizedException('Token inválido o expirado');
        }
    }
    logout(userId) {
        this.logger.log(`Usuario ${userId} ha cerrado sesión`);
        return { message: 'Sesión cerrada exitosamente' };
    }
    async validateUser(userId) {
        return this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles', 'roles.permissions'],
        });
    }
    generateTokens(user) {
        const payload = {
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
    generateAuthResponse(user) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map