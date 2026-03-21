"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
export type LocationType = 'ONLINE' | 'IN_PERSON' | 'HYBRID';
export type RsvpStatus = 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE';

export interface Participant {
  id: string;
  userId: string;
  status: string;
  joinedAt?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration: number;          // backend returns 'duration', not 'durationMinutes'
  organizerId: string;
  status: MeetingStatus;
  meetingUrl?: string;
  location?: string;
  locationType: LocationType;
  privacy: string;
  participants: Participant[];
  clubId?: string;
  createdAt: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  order?: number;
  presenterId?: string;
}

export interface MeetingNote {
  id: string;
  content: string;
  isActionItem: boolean;
  authorId: string;
  createdAt: string;
}

export interface CreateMeetingDto {
  title: string;
  description?: string;
  startTime: string;
  duration: number;
  meetingUrl?: string;
  location?: string;
  participantIds?: string[];
}

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyMeetings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get("/meetings");
      const data = response.data;
      setMeetings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error fetching meetings:", err);
      setError("Failed to load meetings");
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUpcomingMeetings = useCallback(async () => {
    try {
      const response = await apiClient.get("/meetings/upcoming");
      const data = response.data;
      setUpcomingMeetings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error fetching upcoming meetings:", err);
      setUpcomingMeetings([]);
    }
  }, []);

  const fetchMeetingDetail = useCallback(async (id: string): Promise<Meeting | null> => {
    try {
      const response = await apiClient.get(`/meetings/${id}`);
      return response.data;
    } catch (err) {
      console.error("Error fetching meeting detail:", err);
      return null;
    }
  }, []);

  const createMeeting = async (dto: CreateMeetingDto): Promise<Meeting> => {
    const response = await apiClient.post("/meetings", dto);
    await fetchMyMeetings();
    await fetchUpcomingMeetings();
    return response.data;
  };

  const cancelMeeting = async (id: string) => {
    await apiClient.delete(`/meetings/${id}`);
    await fetchMyMeetings();
    await fetchUpcomingMeetings();
  };

  const updateMeeting = async (id: string, dto: Partial<CreateMeetingDto>) => {
    const response = await apiClient.put(`/meetings/${id}`, dto);
    await fetchMyMeetings();
    return response.data;
  };

  const acceptInvitation = async (meetingId: string) => {
    await apiClient.put(`/meetings/${meetingId}/participants/accept`);
    await fetchMyMeetings();
  };

  const declineInvitation = async (meetingId: string) => {
    await apiClient.put(`/meetings/${meetingId}/participants/decline`);
    await fetchMyMeetings();
  };

  const submitRsvp = async (meetingId: string, status: RsvpStatus, notes?: string) => {
    await apiClient.post(`/meetings/${meetingId}/rsvp`, { status, notes });
  };

  const addAgendaItem = async (meetingId: string, dto: Partial<AgendaItem>) => {
    const response = await apiClient.post(`/meetings/${meetingId}/agenda`, dto);
    return response.data;
  };

  const getAgendaItems = async (meetingId: string): Promise<AgendaItem[]> => {
    try {
      const response = await apiClient.get(`/meetings/${meetingId}/agenda`);
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  };

  const getMeetingNotes = async (meetingId: string): Promise<MeetingNote[]> => {
    try {
      const response = await apiClient.get(`/meetings/${meetingId}/notes`);
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  };

  const addMeetingNote = async (meetingId: string, content: string, isActionItem = false) => {
    const response = await apiClient.post(`/meetings/${meetingId}/notes`, {
      content,
      noteType: isActionItem ? 'action_item' : 'general',
    });
    return response.data;
  };

  const checkIn = async (meetingId: string) => {
    await apiClient.post(`/meetings/${meetingId}/attendance/checkin`);
  };

  const checkOut = async (meetingId: string) => {
    await apiClient.post(`/meetings/${meetingId}/attendance/checkout`);
  };

  const addParticipant = async (meetingId: string, participantId: string) => {
    await apiClient.post(`/meetings/${meetingId}/participants`, { participantId });
  };

  useEffect(() => {
    fetchMyMeetings();
    fetchUpcomingMeetings();
  }, [fetchMyMeetings, fetchUpcomingMeetings]);

  return {
    meetings,
    upcomingMeetings,
    isLoading,
    error,
    fetchMyMeetings,
    fetchUpcomingMeetings,
    fetchMeetingDetail,
    createMeeting,
    cancelMeeting,
    updateMeeting,
    acceptInvitation,
    declineInvitation,
    submitRsvp,
    addAgendaItem,
    getAgendaItems,
    getMeetingNotes,
    addMeetingNote,
    checkIn,
    checkOut,
    addParticipant,
  };
}
