import { AttendanceRecord } from '../../../../domain/entities/attendance-record.entity';
import { AttendanceRecordOrmEntity } from '../entities/attendance-record.orm-entity';

export class AttendanceRecordMapper {
  static toDomain(ormEntity: AttendanceRecordOrmEntity): AttendanceRecord {
    return AttendanceRecord.restore(
      ormEntity.id,
      {
        meetingId: ormEntity.meetingId,
        userId: ormEntity.userId,
        attended: ormEntity.attended,
        joinedAt: ormEntity.joinedAt,
        leftAt: ormEntity.leftAt,
        durationMinutes: ormEntity.durationMinutes,
      },
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  static toOrm(entity: AttendanceRecord): AttendanceRecordOrmEntity {
    const ormEntity = new AttendanceRecordOrmEntity();
    ormEntity.id = entity.id;
    ormEntity.meetingId = entity.meetingId;
    ormEntity.userId = entity.userId;
    ormEntity.attended = entity.attended;
    ormEntity.joinedAt = entity.joinedAt;
    ormEntity.leftAt = entity.leftAt;
    ormEntity.durationMinutes = entity.durationMinutes;
    ormEntity.createdAt = entity.createdAt;
    ormEntity.updatedAt = entity.updatedAt || entity.createdAt;
    return ormEntity;
  }
}
