// Meetings API Service - Backend meetings endpoints

import { apiClient } from '@/lib/api-client';
import type {
  MeetingResponse,
  CreateMeetingDto,
  UpdateMeetingDto,
  AddParticipantDto,
} from '@/types';

export const meetingsService = {
  // Yeni toplantı oluştur
  async createMeeting(
    data: CreateMeetingDto,
    token: string
  ): Promise<MeetingResponse> {
    return apiClient.post<MeetingResponse>('/meetings', data, token);
  },

  // Toplantı bilgilerini al
  async getMeeting(meetingId: string, token: string): Promise<MeetingResponse> {
    return apiClient.get<MeetingResponse>(`/meetings/${meetingId}`, token);
  },

  // Toplantıyı güncelle (organizer only)
  async updateMeeting(
    meetingId: string,
    data: UpdateMeetingDto,
    token: string
  ): Promise<MeetingResponse> {
    return apiClient.put<MeetingResponse>(`/meetings/${meetingId}`, data, token);
  },

  // Toplantıyı iptal et (organizer only)
  async cancelMeeting(meetingId: string, token: string): Promise<MeetingResponse> {
    return apiClient.delete<MeetingResponse>(`/meetings/${meetingId}`, token);
  },

  // Kullanıcının tüm toplantılarını listele
  async getUserMeetings(token: string): Promise<MeetingResponse[]> {
    return apiClient.get<MeetingResponse[]>('/meetings', token);
  },

  // Yaklaşan toplantıları listele
  async getUpcomingMeetings(token: string): Promise<MeetingResponse[]> {
    return apiClient.get<MeetingResponse[]>('/meetings/upcoming', token);
  },

  // Toplantıya katılımcı ekle (organizer only)
  async addParticipant(
    meetingId: string,
    data: AddParticipantDto,
    token: string
  ): Promise<MeetingResponse> {
    return apiClient.post<MeetingResponse>(
      `/meetings/${meetingId}/participants`,
      data,
      token
    );
  },

  // Toplantı davetini kabul et
  async acceptInvitation(
    meetingId: string,
    token: string
  ): Promise<MeetingResponse> {
    return apiClient.put<MeetingResponse>(
      `/meetings/${meetingId}/participants/accept`,
      undefined,
      token
    );
  },

  // Toplantı davetini reddet
  async declineInvitation(
    meetingId: string,
    token: string
  ): Promise<MeetingResponse> {
    return apiClient.put<MeetingResponse>(
      `/meetings/${meetingId}/participants/decline`,
      undefined,
      token
    );
  },
};
