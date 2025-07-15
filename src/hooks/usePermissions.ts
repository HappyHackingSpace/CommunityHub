import { useAuth } from './useAuth';
import { Permission } from '@/types/auth';
import { hasPermission, getUserPermissions, canUserPerform, AVAILABLE_PERMISSIONS } from '@/lib/permissions';

export function usePermissions() {
  const { user } = useAuth();

  return {
    // Temel permission kontrolleri
    hasPermission: async (permission: Permission) => {
      if (!user?.id) return false;
      return hasPermission(user.id, permission);
    },
    
    hasAnyPermission: async (permissions: Permission[]) => {
      if (!user?.id) return false;
      for (const permission of permissions) {
        if (await hasPermission(user.id, permission)) {
          return true;
        }
      }
      return false;
    },
    
    hasAllPermissions: async (permissions: Permission[]) => {
      if (!user?.id) return false;
      for (const permission of permissions) {
        if (!(await hasPermission(user.id, permission))) {
          return false;
        }
      }
      return true;
    },

    // Kullanıcı action'ları kontrol etme
    canPerform: async (action: string) => {
      if (!user?.id) return false;
      return canUserPerform(user.id, action);
    },

    // Kullanıcının tüm yetkilerini alma
    getUserPermissions: async () => {
      if (!user?.id) return [];
      return getUserPermissions(user.id);
    },

    // Mevcut yetkiler listesi
    availablePermissions: AVAILABLE_PERMISSIONS,

    // Kullanıcı bilgileri
    user,
    isAuthenticated: !!user
  };
}
