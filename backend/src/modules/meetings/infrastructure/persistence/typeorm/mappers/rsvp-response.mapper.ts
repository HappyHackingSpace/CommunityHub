import { RsvpResponse } from '../../../../domain/entities/rsvp-response.entity';
import { RsvpResponseOrmEntity } from '../entities/rsvp-response.orm-entity';

export class RsvpResponseMapper {
  static toDomain(ormEntity: RsvpResponseOrmEntity): RsvpResponse {
    return RsvpResponse.restore(
      ormEntity.id,
      {
        meetingId: ormEntity.meetingId,
        userId: ormEntity.userId,
        status: ormEntity.status,
        respondedAt: ormEntity.respondedAt,
        notes: ormEntity.notes,
      },
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  static toOrm(entity: RsvpResponse): RsvpResponseOrmEntity {
    const ormEntity = new RsvpResponseOrmEntity();
    ormEntity.id = entity.id;
    ormEntity.meetingId = entity.meetingId;
    ormEntity.userId = entity.userId;
    ormEntity.status = entity.status;
    ormEntity.respondedAt = entity.respondedAt;
    ormEntity.notes = entity.notes;
    ormEntity.createdAt = entity.createdAt;
    ormEntity.updatedAt = entity.updatedAt || entity.createdAt;
    return ormEntity;
  }
}
