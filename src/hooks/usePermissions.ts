import { useAuth } from './useAuth';
import { Permission } from '@/types/auth';
import { hasPermission, hasAnyPermission, hasAllPermissions, getUIPermissions } from '@/lib/permissions';

export function usePermissions() {
  const { user } = useAuth();

  return {
    // Temel permission kontrolleri
    hasPermission: (permission: Permission, context?: { clubId?: string; resourceOwnerId?: string }) =>
      hasPermission(user, permission, context),
    
    hasAnyPermission: (permissions: Permission[], context?: { clubId?: string; resourceOwnerId?: string }) =>
      hasAnyPermission(user, permissions, context),
    
    hasAllPermissions: (permissions: Permission[], context?: { clubId?: string; resourceOwnerId?: string }) =>
      hasAllPermissions(user, permissions, context),

    // UI permissions
    ui: getUIPermissions(user),

    // Kullanıcı bilgileri
    user,
    isAuthenticated: !!user
  };
}
