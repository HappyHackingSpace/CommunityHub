import { MeetingResource } from '../entities/meeting-resource.entity';

export interface IMeetingResourceRepository {
  save(resource: MeetingResource): Promise<MeetingResource>;
  findById(id: string): Promise<MeetingResource | null>;
  findByMeetingId(meetingId: string): Promise<MeetingResource[]>;
  delete(id: string): Promise<void>;
}
