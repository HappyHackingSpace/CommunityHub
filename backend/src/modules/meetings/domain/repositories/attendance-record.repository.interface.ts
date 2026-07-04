import { AttendanceRecord } from '../entities/attendance-record.entity';

export interface IAttendanceRecordRepository {
  save(record: AttendanceRecord): Promise<AttendanceRecord>;
  findById(id: string): Promise<AttendanceRecord | null>;
  findByMeetingId(meetingId: string): Promise<AttendanceRecord[]>;
  findByMeetingAndUser(meetingId: string, userId: string): Promise<AttendanceRecord | null>;
  findByUserId(userId: string): Promise<AttendanceRecord[]>;
  delete(id: string): Promise<void>;
}
