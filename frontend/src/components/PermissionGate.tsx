import React, { ReactNode } from 'react';
import { Result } from 'antd';

export interface PermissionGateProps {
  module: string;
  action: string;
  hasPermission: (module: string, action: string) => boolean;
  children: ReactNode;
  fallback?: ReactNode;
  hidden?: boolean;
}

/**
 * PermissionGate Component
 * Renders children only if user has the required permission
 *
 * Usage:
 * <PermissionGate
 *   module="products"
 *   action="create"
 *   hasPermission={hasPermission}
 * >
 *   <Button>Create Product</Button>
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  module,
  action,
  hasPermission,
  children,
  fallback,
  hidden = false,
}) => {
  const permitted = hasPermission(module, action);

  if (!permitted) {
    if (hidden) {
      return null;
    }
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <Result
        status="403"
        title="403"
        subTitle={`No tiene permisos para ${action} en ${module}`}
      />
    );
  }

  return <>{children}</>;
};

/**
 * Can Component - Alias for PermissionGate with simpler naming
 * Usage:
 * <Can module="products" action="edit" can={hasPermission}>
 *   <Button>Edit</Button>
 * </Can>
 */
export const Can: React.FC<
  Omit<PermissionGateProps, 'hasPermission'> & {
    can: (module: string, action: string) => boolean;
  }
> = ({ module, action, can, children, fallback, hidden }) => {
  return (
    <PermissionGate
      module={module}
      action={action}
      hasPermission={can}
      fallback={fallback}
      hidden={hidden}
    >
      {children}
    </PermissionGate>
  );
};

/**
 * Show Component - Renders if user has permission
 * Usage:
 * <Show when={hasPermission('products', 'view')}>
 *   <div>Product content</div>
 * </Show>
 */
export interface ShowProps {
  when: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export const Show: React.FC<ShowProps> = ({ when, children, fallback }) => {
  return when ? <>{children}</> : fallback ? <>{fallback}</> : null;
};
