import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { Permission, Role } from './entities';
import { SeedPermissionsService } from '../../database/seeds/seed-permissions';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, Role]),
    CacheModule.register(),
  ],
  providers: [PermissionsService, SeedPermissionsService],
  controllers: [PermissionsController],
  exports: [PermissionsService, SeedPermissionsService],
})
export class PermissionsModule {}
