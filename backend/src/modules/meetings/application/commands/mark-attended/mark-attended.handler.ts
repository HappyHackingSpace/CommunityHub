import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MarkAttendedCommand } from './mark-attended.command';
import { AttendanceRecord } from '../../../domain/entities/attendance-record.entity';
import type { IAttendanceRecordRepository } from '../../../domain/repositories/attendance-record.repository.interface';
import type { IMeetingRepository } from '../../../domain/repositories/meeting.repository.interface';

@CommandHandler(MarkAttendedCommand)
export class MarkAttendedHandler implements ICommandHandler<MarkAttendedCommand> {
  constructor(
    @Inject('IAttendanceRecordRepository')
    private readonly attendanceRecordRepository: IAttendanceRecordRepository,
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async execute(command: MarkAttendedCommand): Promise<AttendanceRecord> {
    const { meetingId, userId } = command;

    // Verify meeting exists
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Check if attendance record already exists
    let attendanceRecord = await this.attendanceRecordRepository.findByMeetingAndUser(
      meetingId,
      userId,
    );

    if (attendanceRecord) {
      // Update existing record
      attendanceRecord.markAsAttended(new Date());
    } else {
      // Create new attendance record
      attendanceRecord = AttendanceRecord.create({
        meetingId,
        userId,
        attended: true,
        joinedAt: new Date(),
      });
    }

    // Save attendance record
    const savedRecord = await this.attendanceRecordRepository.save(attendanceRecord);

    return savedRecord;
  }
}
