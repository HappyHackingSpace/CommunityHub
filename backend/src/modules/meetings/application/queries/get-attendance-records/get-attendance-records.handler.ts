import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAttendanceRecordsQuery } from './get-attendance-records.query';
import { AttendanceRecord } from '../../../domain/entities/attendance-record.entity';
import type { IAttendanceRecordRepository } from '../../../domain/repositories/attendance-record.repository.interface';

@QueryHandler(GetAttendanceRecordsQuery)
export class GetAttendanceRecordsHandler implements IQueryHandler<GetAttendanceRecordsQuery> {
  constructor(
    @Inject('IAttendanceRecordRepository')
    private readonly attendanceRecordRepository: IAttendanceRecordRepository,
  ) {}

  async execute(query: GetAttendanceRecordsQuery): Promise<AttendanceRecord[]> {
    const { meetingId } = query;
    return this.attendanceRecordRepository.findByMeetingId(meetingId);
  }
}
