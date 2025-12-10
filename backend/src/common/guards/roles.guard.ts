import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = context.switchToHttp().getRequest();
    const user =
      typeof req === 'object' && req !== null
        ? (req as Record<string, unknown>)['user']
        : undefined;

    if (typeof user !== 'object' || user === null) return false;

    // Check for single role (new structure)
    const role = (user as Record<string, unknown>)['role'];
    if (typeof role === 'object' && role !== null && 'name' in (role as Record<string, unknown>)) {
      const roleName = (role as Record<string, unknown>)['name'] as string;
      return requiredRoles.includes(roleName);
    }

    // Fallback to roles array (old structure)
    const roles = (user as Record<string, unknown>)['roles'];
    if (!Array.isArray(roles)) return false;

    return requiredRoles.some((role) =>
      roles.some(
        (r) =>
          typeof r === 'object' &&
          r !== null &&
          'name' in (r as Record<string, unknown>) &&
          (r as Record<string, unknown>)['name'] === role,
      ),
    );
  }
}
