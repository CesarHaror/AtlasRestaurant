import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ParseIdPipe } from '../../common/pipes/parse-id.pipe';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('Administrador', 'Gerente')
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(page, limit, search);
  }

  @Post()
  @Roles('Administrador', 'Gerente')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: unknown) {
    const id = (user as Record<string, unknown>)['id'];
    return this.usersService.getProfile(String(id));
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente')
  findOne(@Param('id', new ParseIdPipe({ version: '4' })) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador', 'Gerente')
  update(
    @Param('id', new ParseIdPipe({ version: '4' })) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/password')
  updatePassword(
    @Param('id', new ParseIdPipe({ version: '4' })) id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser() user: unknown,
  ) {
    const userId = (user as Record<string, unknown>)['id'];
    const roles = (user as Record<string, unknown>)['roles'];
    const isAdmin = Array.isArray(roles)
      ? roles.some(
          (r) =>
            typeof r === 'object' &&
            r !== null &&
            (r as Record<string, unknown>)['name'] === 'Administrador',
        )
      : false;

    if (String(userId) !== id && !isAdmin) {
      throw new UnauthorizedException(
        'No autorizado para cambiar la contraseña de otro usuario',
      );
    }
    return this.usersService.updatePassword(id, updatePasswordDto);
  }

  @Patch(':id/toggle-active')
  @Roles('Administrador')
  toggleActive(@Param('id', new ParseIdPipe({ version: '4' })) id: string) {
    return this.usersService.toggleActive(id);
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id', new ParseIdPipe({ version: '4' })) id: string) {
    return this.usersService.remove(id);
  }
}
