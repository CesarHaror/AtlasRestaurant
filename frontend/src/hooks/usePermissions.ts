import { useCallback, useEffect, useState } from 'react';

interface PermissionCache {
  permissions: string[];
  timestamp: number;
  expiresAt: number;
}

const PERMISSION_CACHE_KEY = 'user_permissions';
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

class PermissionCacheManager {
  private cache: Map<string, PermissionCache> = new Map();

  set(userId: string, permissions: string[]): void {
    const timestamp = Date.now();
    this.cache.set(userId, {
      permissions,
      timestamp,
      expiresAt: timestamp + CACHE_TTL,
    });
  }

  get(userId: string): string[] | null {
    const cached = this.cache.get(userId);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(userId);
      return null;
    }

    return cached.permissions;
  }

  clear(userId?: string): void {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
  }
}

const cacheManager = new PermissionCacheManager();

export interface UsePermissionsReturn {
  hasPermission: (module: string, action: string) => boolean;
  hasPermissions: (permissions: Array<{ module: string; action: string }>) => boolean;
  hasAnyPermission: (permissions: Array<{ module: string; action: string }>) => boolean;
  can: (module: string, action: string) => boolean;
  cannot: (module: string, action: string) => boolean;
  permissions: string[];
  isLoading: boolean;
  error: Error | null;
}

export function usePermissions(userId: string | null): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setPermissions([]);
      setIsLoading(false);
      return;
    }

    // Try to get from cache first
    const cached = cacheManager.get(userId);
    if (cached) {
      setPermissions(cached);
      setIsLoading(false);
      return;
    }

    // For now, permissions will be loaded from the JWT payload
    // In a real scenario, you'd fetch them from an API
    // This is a placeholder
    setPermissions([]);
    setIsLoading(false);
  }, [userId]);

  const hasPermission = useCallback(
    (module: string, action: string): boolean => {
      const permission = `${module}:${action}`;
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasPermissions = useCallback(
    (perms: Array<{ module: string; action: string }>): boolean => {
      // Returns true if user has ALL permissions
      return perms.every((perm) => hasPermission(perm.module, perm.action));
    },
    [hasPermission]
  );

  const hasAnyPermission = useCallback(
    (perms: Array<{ module: string; action: string }>): boolean => {
      // Returns true if user has ANY permission
      return perms.some((perm) => hasPermission(perm.module, perm.action));
    },
    [hasPermission]
  );

  return {
    hasPermission,
    hasPermissions,
    hasAnyPermission,
    can: hasPermission,
    cannot: (module: string, action: string) => !hasPermission(module, action),
    permissions,
    isLoading,
    error,
  };
}

/**
 * Hook para obtener permiso específico del JWT
 * Usage: const { hasPermission } = usePermissionCheck(user);
 */
export function usePermissionCheck(user: any): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!user || !user.permissions) {
      setPermissions([]);
      return;
    }
    setPermissions(user.permissions);
  }, [user]);

  const hasPermission = useCallback(
    (module: string, action: string): boolean => {
      const permission = `${module}:${action}`;
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasPermissions = useCallback(
    (perms: Array<{ module: string; action: string }>): boolean => {
      return perms.every((perm) => hasPermission(perm.module, perm.action));
    },
    [hasPermission]
  );

  const hasAnyPermission = useCallback(
    (perms: Array<{ module: string; action: string }>): boolean => {
      return perms.some((perm) => hasPermission(perm.module, perm.action));
    },
    [hasPermission]
  );

  return {
    hasPermission,
    hasPermissions,
    hasAnyPermission,
    can: hasPermission,
    cannot: (module: string, action: string) => !hasPermission(module, action),
    permissions,
    isLoading: false,
    error: null,
  };
}
