import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAttendanceRecordRepository } from '../../../../domain/repositories/attendance-record.repository.interface';
import { AttendanceRecord } from '../../../../domain/entities/attendance-record.entity';
import { AttendanceRecordOrmEntity } from '../entities/attendance-record.orm-entity';
import { AttendanceRecordMapper } from '../mappers/attendance-record.mapper';

@Injectable()
export class AttendanceRecordRepository implements IAttendanceRecordRepository {
  constructor(
    @InjectRepository(AttendanceRecordOrmEntity)
    private readonly repository: Repository<AttendanceRecordOrmEntity>,
  ) {}

  async save(record: AttendanceRecord): Promise<AttendanceRecord> {
    const ormEntity = AttendanceRecordMapper.toOrm(record);
    const saved = await this.repository.save(ormEntity);
    return AttendanceRecordMapper.toDomain(saved);
  }

  async findById(id: string): Promise<AttendanceRecord | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? AttendanceRecordMapper.toDomain(ormEntity) : null;
  }

  async findByMeetingId(meetingId: string): Promise<AttendanceRecord[]> {
    const ormEntities = await this.repository.find({
      where: { meetingId },
      order: { createdAt: 'ASC' },
    });
    return ormEntities.map(AttendanceRecordMapper.toDomain);
  }

  async findByMeetingAndUser(
    meetingId: string,
    userId: string,
  ): Promise<AttendanceRecord | null> {
    const ormEntity = await this.repository.findOne({
      where: { meetingId, userId },
    });
    return ormEntity ? AttendanceRecordMapper.toDomain(ormEntity) : null;
  }

  async findByUserId(userId: string): Promise<AttendanceRecord[]> {
    const ormEntities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map(AttendanceRecordMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
