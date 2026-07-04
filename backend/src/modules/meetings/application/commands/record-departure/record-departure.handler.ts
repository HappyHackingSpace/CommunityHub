import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RecordDepartureCommand } from './record-departure.command';
import { AttendanceRecord } from '../../../domain/entities/attendance-record.entity';
import type { IAttendanceRecordRepository } from '../../../domain/repositories/attendance-record.repository.interface';

@CommandHandler(RecordDepartureCommand)
export class RecordDepartureHandler implements ICommandHandler<RecordDepartureCommand> {
  constructor(
    @Inject('IAttendanceRecordRepository')
    private readonly attendanceRecordRepository: IAttendanceRecordRepository,
  ) {}

  async execute(command: RecordDepartureCommand): Promise<AttendanceRecord> {
    const { meetingId, userId } = command;

    // Find attendance record
    const attendanceRecord = await this.attendanceRecordRepository.findByMeetingAndUser(
      meetingId,
      userId,
    );

    if (!attendanceRecord) {
      throw new Error('Attendance record not found. User must check in first.');
    }

    // Record departure
    attendanceRecord.recordDeparture(new Date());

    // Save attendance record
    const savedRecord = await this.attendanceRecordRepository.save(attendanceRecord);

    return savedRecord;
  }
}
