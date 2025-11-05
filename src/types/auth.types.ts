// Auth Types - Backend API'ye uygun

export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ORGANIZER = 'ORGANIZER',
  MENTOR = 'MENTOR',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  DELETED = 'DELETED'
}

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  roles: RoleType[];
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AssignRoleDto {
  role: RoleType;
}

export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
