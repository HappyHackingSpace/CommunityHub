import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserAttendanceHistoryQuery } from './get-user-attendance-history.query';
import { AttendanceRecord } from '../../../domain/entities/attendance-record.entity';
import type { IAttendanceRecordRepository } from '../../../domain/repositories/attendance-record.repository.interface';

@QueryHandler(GetUserAttendanceHistoryQuery)
export class GetUserAttendanceHistoryHandler implements IQueryHandler<GetUserAttendanceHistoryQuery> {
  constructor(
    @Inject('IAttendanceRecordRepository')
    private readonly attendanceRecordRepository: IAttendanceRecordRepository,
  ) {}

  async execute(query: GetUserAttendanceHistoryQuery): Promise<AttendanceRecord[]> {
    const { userId } = query;
    return this.attendanceRecordRepository.findByUserId(userId);
  }
}
