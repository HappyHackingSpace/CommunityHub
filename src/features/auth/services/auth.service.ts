// Auth API Service - Backend auth endpoints

import { apiClient } from '@/lib/api-client';
import type { UserResponse, AssignRoleDto } from '@/types';

export const authService = {
  // Google OAuth login URL'ini döndür
  getGoogleLoginUrl(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return `${apiUrl}/auth/google`;
  },

  // Profil bilgilerini al
  async getProfile(token: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>('/auth/profile', token);
  },

  // Mevcut kullanıcı bilgilerini al
  async getCurrentUser(token: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>('/users/me', token);
  },

  // Kullanıcı ID'sine göre kullanıcı bilgisi al (Admin only)
  async getUserById(userId: string, token: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>(`/users/${userId}`, token);
  },

  // Kullanıcıya rol ata (Admin only)
  async assignRole(
    userId: string,
    roleData: AssignRoleDto,
    token: string
  ): Promise<UserResponse> {
    return apiClient.patch<UserResponse>(
      `/users/${userId}/roles`,
      roleData,
      token
    );
  },
};
