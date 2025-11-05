// Meeting Types - Backend API'ye uygun

export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ParticipantStatus {
  INVITED = 'invited',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  ATTENDING = 'attending'
}

export interface ParticipantDto {
  userId: string;
  status: ParticipantStatus;
  joinedAt?: string;
}

export interface MeetingResponse {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  duration: number;
  organizerId: string;
  participants: ParticipantDto[];
  status: MeetingStatus;
  meetingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingDto {
  title: string;
  description?: string;
  startTime: string;
  duration: number;
  meetingUrl?: string;
  participantIds?: string[];
}

export interface UpdateMeetingDto {
  title?: string;
  description?: string;
  startTime?: string;
  duration?: number;
  meetingUrl?: string;
}

export interface AddParticipantDto {
  participantId: string;
}
