import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('El email ya está registrado');
      }
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('El username ya está en uso');
      }
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Crear usuario
    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });

    // Asignar rol si se proporciona
    if (createUserDto.roleId) {
      user.roleId = createUserDto.roleId;
    }

    await this.userRepository.save(user);
    // Excluir passwordHash en la respuesta
    const userWithoutPassword = { ...(user as unknown as Record<string, unknown>) };
    delete userWithoutPassword.passwordHash;
    return userWithoutPassword as unknown as User;
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
    search?: string,
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permission');
    if (search) {
      query.andWhere(
        'user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search',
        { search: `%${search}%` },
      );
    }
    const [data, total] = await query.skip(skip).take(limit).getManyAndCount();
    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'role.permissions'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['role', 'role.permissions'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['role', 'role.permissions'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    // Verificar email/username duplicados
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (emailExists)
        throw new ConflictException('El email ya está registrado');
    }
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const usernameExists = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (usernameExists)
        throw new ConflictException('El username ya está en uso');
    }
    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);
    return this.findOne(id);
  }

  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    // Verificar contraseña actual
    const passwordMatch = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.passwordHash,
    );
    if (!passwordMatch)
      throw new BadRequestException('La contraseña actual es incorrecta');
    // Verificar confirmación
    if (updatePasswordDto.newPassword !== updatePasswordDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas nuevas no coinciden');
    }
    user.passwordHash = await bcrypt.hash(updatePasswordDto.newPassword, 12);
    await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.isActive = false;
    await this.userRepository.save(user);
  }

  async toggleActive(id: string): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.isActive = !user.isActive;
    await this.userRepository.save(user);
    return this.findOne(id);
  }

  async getProfile(id: string): Promise<User> {
    return this.findOne(id);
  }
}
