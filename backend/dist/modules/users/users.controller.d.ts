import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(page?: number, limit?: number, search?: string): Promise<{
        data: import("./entities/user.entity").User[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    create(createUserDto: CreateUserDto): Promise<import("./entities/user.entity").User>;
    getProfile(user: unknown): Promise<import("./entities/user.entity").User>;
    findOne(id: string): Promise<import("./entities/user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("./entities/user.entity").User>;
    updatePassword(id: string, updatePasswordDto: UpdatePasswordDto, user: unknown): Promise<void>;
    toggleActive(id: string): Promise<import("./entities/user.entity").User>;
    remove(id: string): Promise<void>;
}
