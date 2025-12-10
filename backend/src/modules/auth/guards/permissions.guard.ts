import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../../permissions/permissions.service';
import {
  REQUIRE_PERMISSIONS_KEY,
  RequiredPermission,
} from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<RequiredPermission>(
      REQUIRE_PERMISSIONS_KEY,
      context.getHandler(),
    );

    // If no permission is required, allow access
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    const hasPermission = await this.permissionsService.hasPermission(
      user.id,
      requiredPermission.module,
      requiredPermission.action,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Missing permission: ${requiredPermission.module}:${requiredPermission.action}`,
      );
    }

    return true;
  }
}
