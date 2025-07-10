export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'club_leader' | 'member';
  clubId?: string;
  avatar?: string;
  createdAt: string;
}

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