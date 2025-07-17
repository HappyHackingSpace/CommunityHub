// src/lib/permissions.ts
import { createClient } from '@/lib/supabase-client'

export interface UserPermission {
  name: string;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
}

// Universal permission check (works everywhere)
export async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { data: user } = await supabase
      .from('users')
      .select('permissions, role')
      .eq('id', userId)
      .single()

    if (!user) return false

    // Admin her şeyi yapabilir
    if (user.role === 'admin') return true

    // JSON permissions'ları kontrol et
    const permissions = user.permissions || []
    return permissions.some((p: UserPermission) => p.name === permissionName)
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

// Kullanıcının tüm yetkileri
export async function getUserPermissions(userId: string): Promise<UserPermission[]> {
  try {
    const supabase = createClient()
    
    const { data: user } = await supabase
      .from('users')
      .select('permissions')
      .eq('id', userId)
      .single()

    return user?.permissions || []
  } catch (error) {
    console.error('Get user permissions error:', error)
    return []
  }
}

// Kullanıcıya yetki atar
export async function grantPermission(
  userId: string, 
  permissionName: string, 
  grantedBy: string,
  expiresAt?: string
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { data: user } = await supabase
      .from('users')
      .select('permissions')
      .eq('id', userId)
      .single()

    let permissions = user?.permissions || []
    
    // JSON string'leri object'e çevir
    permissions = permissions.map((p: any) => {
      if (typeof p === 'string') {
        try {
          return JSON.parse(p)
        } catch {
          console.error('Failed to parse permission:', p)
        }
      }
      return p
    })
    
    // Duplicate check
    if (permissions.some((p: UserPermission) => p.name === permissionName)) {
      return false
    }

    // Yeni yetki ekle
    permissions.push({
      name: permissionName,
      granted_by: grantedBy,
      granted_at: new Date().toISOString(),
      ...(expiresAt && { expires_at: expiresAt })
    })

    const { error } = await supabase
      .from('users')
      .update({ permissions })
      .eq('id', userId)

    return !error
  } catch (error) {
    console.error('Grant permission error:', error)
    return false
  }
}

// Kullanıcıdan yetki al
export async function revokePermission(userId: string, permissionName: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { data: user } = await supabase
      .from('users')
      .select('permissions')
      .eq('id', userId)
      .single()

    const permissions = (user?.permissions || []).filter(
      (p: UserPermission) => p.name !== permissionName
    )

    const { error } = await supabase
      .from('users')
      .update({ permissions })
      .eq('id', userId)

    return !error
  } catch (error) {
    console.error('Revoke permission error:', error)
    return false
  }
}

// Bulk permission set
export async function setUserPermissions(
  userId: string, 
  permissionNames: string[], 
  grantedBy: string
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const permissions = permissionNames.map(name => ({
      name,
      granted_by: grantedBy,
      granted_at: new Date().toISOString()
    }))

    const { error } = await supabase
      .from('users')
      .update({ permissions })
      .eq('id', userId)

    return !error
  } catch (error) {
    console.error('Set user permissions error:', error)
    return false
  }
}

// Legacy role system ile hybrid check
export async function canUserPerform(userId: string, action: string): Promise<boolean> {
  const supabase = createClient()
  
  // Önce yeni permission sistemini dene
  const hasNewPermission = await hasPermission(userId, action)
  if (hasNewPermission) return true

  // Fallback: Eski role sistemini kontrol et
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (!user) return false

  // Admin her şeyi yapabilir
  if (user.role === 'admin') return true

  // Club leader'lar için temel yetkiler
  if (user.role === 'club_leader') {
    const clubLeaderPermissions = [
      'CREATE_CLUB', 
      'CREATE_TASK', 
      'ASSIGN_TASK', 
      'UPLOAD_FILE'
    ]
    return clubLeaderPermissions.includes(action)
  }

  // Member'lar için temel yetkiler
  if (user.role === 'member') {
    const memberPermissions = ['UPLOAD_FILE']
    return memberPermissions.includes(action)
  }

  return false
}

// Available permissions list (hardcoded)
export const AVAILABLE_PERMISSIONS = [
  // USER MANAGEMENT
  { name: 'MANAGE_USERS', description: 'Kullanıcıları yönetebilir', category: 'user_management' },
  { name: 'ASSIGN_PERMISSIONS', description: 'Yetki atayabilir', category: 'user_management' },
  { name: 'VIEW_USER_LIST', description: 'Kullanıcı listesini görebilir', category: 'user_management' },

  // CLUB MANAGEMENT
  { name: 'CREATE_CLUB', description: 'Kulüp oluşturabilir', category: 'club_management' },
  { name: 'MANAGE_ANY_CLUB', description: 'Tüm kulüpleri yönetebilir', category: 'club_management' },
  { name: 'DELETE_CLUB', description: 'Kulüp silebilir', category: 'club_management' },
  { name: 'EDIT_CLUB_SETTINGS', description: 'Kulüp ayarlarını düzenleyebilir', category: 'club_management' },

  // TASK MANAGEMENT
  { name: 'CREATE_TASK', description: 'Görev oluşturabilir', category: 'task_management' },
  { name: 'ASSIGN_TASK', description: 'Görev atayabilir', category: 'task_management' },
  { name: 'DELETE_ANY_TASK', description: 'Herhangi bir görevi silebilir', category: 'task_management' },
  { name: 'GRADE_TASK', description: 'Görev değerlendirebilir', category: 'task_management' },

  // FILE MANAGEMENT
  { name: 'UPLOAD_FILE', description: 'Dosya yükleyebilir', category: 'file_management' },
  { name: 'DELETE_ANY_FILE', description: 'Herhangi bir dosyayı silebilir', category: 'file_management' },
  { name: 'MANAGE_FOLDERS', description: 'Klasör yönetebilir', category: 'file_management' },

  // SYSTEM
  { name: 'ADMIN_PANEL_ACCESS', description: 'Admin paneline erişebilir', category: 'system' },
  { name: 'SYSTEM_SETTINGS', description: 'Sistem ayarlarını değiştirebilir', category: 'system' },
]