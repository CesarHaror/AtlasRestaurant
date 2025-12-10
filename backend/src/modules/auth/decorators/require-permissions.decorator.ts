import { SetMetadata } from '@nestjs/common';

export interface RequiredPermission {
  module: string;
  action: string;
}

export const REQUIRE_PERMISSIONS_KEY = 'require_permissions';

export const RequirePermissions = (module: string, action: string) =>
  SetMetadata(REQUIRE_PERMISSIONS_KEY, { module, action });
