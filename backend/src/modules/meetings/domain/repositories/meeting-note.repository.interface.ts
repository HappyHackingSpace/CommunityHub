import { MeetingNote } from '../entities/meeting-note.entity';

export interface IMeetingNoteRepository {
  save(note: MeetingNote): Promise<MeetingNote>;
  findById(id: string): Promise<MeetingNote | null>;
  findByMeetingId(meetingId: string): Promise<MeetingNote[]>;
  findActionItemsByMeetingId(meetingId: string): Promise<MeetingNote[]>;
  delete(id: string): Promise<void>;
}
