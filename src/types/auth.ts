export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'club_leader' | 'member';
  clubId?: string;
  avatar?: string;
  createdAt: string;
}

// Permission sistemi için yeni tipler
export type Permission = 
  | 'club:create'
  | 'club:edit'
  | 'club:delete'
  | 'club:view'
  | 'club:join'
  | 'club:leave'
  | 'member:add'
  | 'member:remove'
  | 'meeting:create'
  | 'meeting:edit'
  | 'meeting:delete'
  | 'task:create'
  | 'task:assign'
  | 'task:complete'
  | 'file:upload'
  | 'file:delete';

export type Role = 'admin' | 'club_leader' | 'member';

// Her rol için izin haritası
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'club:create',
    'club:edit', 
    'club:delete',
    'club:view',
    'club:join',
    'club:leave',
    'member:add',
    'member:remove',
    'meeting:create',
    'meeting:edit',
    'meeting:delete',
    'task:create',
    'task:assign',
    'task:complete',
    'file:upload',
    'file:delete'
  ],
  club_leader: [
    'club:create',
    'club:edit', // Sadece kendi kulübünü
    'club:view',
    'club:join',
    'club:leave',
    'member:add',
    'member:remove',
    'meeting:create',
    'meeting:edit',
    'meeting:delete',
    'task:create',
    'task:assign',
    'task:complete',
    'file:upload',
    'file:delete'
  ],
  member: [
    'club:view',
    'club:join',
    'club:leave',
    'meeting:create', // Kulübün ayarlarına göre
    'task:complete',
    'file:upload'
  ]
};

export interface Club {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  leaderName: string;
  memberCount: number;
  type: 'education' | 'social' | 'project';
  createdAt: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}