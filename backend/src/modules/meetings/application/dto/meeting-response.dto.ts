import { MeetingStatus } from '../../domain/enums/meeting-status.enum';
import { ParticipantStatus } from '../../domain/enums/participant-status.enum';
import { Meeting } from '../../domain/entities/meeting.entity';

export interface ParticipantDto {
  userId: string;
  status: ParticipantStatus;
  joinedAt?: Date;
}

export class MeetingResponseDto {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  organizerId: string;
  participants: ParticipantDto[];
  status: MeetingStatus;
  meetingUrl?: string;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(meeting: Meeting): MeetingResponseDto {
    return {
      id: meeting.id,
      title: meeting.title.value,
      description: meeting.description,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      duration: meeting.duration.minutes,
      organizerId: meeting.organizerId,
      participants: meeting.participants,
      status: meeting.status,
      meetingUrl: meeting.meetingUrl,
      createdAt: meeting.createdAt,
      updatedAt: meeting.updatedAt,
    };
  }
}