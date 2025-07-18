import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/types/auth';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // true ise tüm izinler gerekli, false ise herhangi biri yeterli
  context?: {
    clubId?: string;
    resourceOwnerId?: string;
  };
  fallback?: ReactNode;
  roles?: ('admin' | 'club_leader' | 'member')[]; // Direkt rol kontrolü için
}

export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  context,
  fallback = null,
  roles
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, user } = usePermissions();

  // Rol bazlı kontrol
  if (roles && user) {
    if (!roles.includes(user.role)) {
      return <>{fallback}</>;
    }
  }

  // İzin bazlı kontrol
  if (permission) {
    if (!hasPermission(permission, context)) {
      return <>{fallback}</>;
    }
  }

  if (permissions) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(permissions, context)
      : hasAnyPermission(permissions, context);

    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Kullanım örnekleri:
// <PermissionGate permission="club:create">
//   <CreateClubButton />
// </PermissionGate>

// <PermissionGate permissions={["club:edit", "club:delete"]} context={{ clubId: "123" }}>
//   <ClubManagementPanel />
// </PermissionGate>

// <PermissionGate roles={["admin"]}>
//   <AdminPanel />
// </PermissionGate>
