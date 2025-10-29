import { Meeting } from '../entities/meeting.entity';

export interface IMeetingRepository {
  save(meeting: Meeting): Promise<Meeting>;

  findById(id: string): Promise<Meeting | null>;
  findByOrganizerId(organizerId: string): Promise<Meeting[]>;
  findByParticipantId(participantId: string): Promise<Meeting[]>;
  findUpcoming(userId: string): Promise<Meeting[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Meeting[]>;
  findAll(): Promise<Meeting[]>;

  update(meeting: Meeting): Promise<Meeting>;

  delete(id: string): Promise<void>;

  exists(id: string): Promise<boolean>;
}