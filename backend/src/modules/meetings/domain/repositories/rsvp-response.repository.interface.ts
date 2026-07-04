import { RsvpResponse } from '../entities/rsvp-response.entity';

export interface IRsvpResponseRepository {
  save(rsvp: RsvpResponse): Promise<RsvpResponse>;
  findById(id: string): Promise<RsvpResponse | null>;
  findByMeetingId(meetingId: string): Promise<RsvpResponse[]>;
  findByMeetingAndUser(meetingId: string, userId: string): Promise<RsvpResponse | null>;
  findByUserId(userId: string): Promise<RsvpResponse[]>;
  delete(id: string): Promise<void>;
}
