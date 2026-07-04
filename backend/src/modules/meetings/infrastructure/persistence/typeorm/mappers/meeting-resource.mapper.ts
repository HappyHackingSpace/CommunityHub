import { MeetingResource } from '../../../../domain/entities/meeting-resource.entity';
import { MeetingResourceOrmEntity } from '../entities/meeting-resource.orm-entity';

export class MeetingResourceMapper {
  static toDomain(ormEntity: MeetingResourceOrmEntity): MeetingResource {
    return MeetingResource.restore(
      ormEntity.id,
      {
        meetingId: ormEntity.meetingId,
        title: ormEntity.title,
        url: ormEntity.url,
        type: ormEntity.type,
        description: ormEntity.description,
        uploadedBy: ormEntity.uploadedBy,
      },
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  static toOrm(entity: MeetingResource): MeetingResourceOrmEntity {
    const ormEntity = new MeetingResourceOrmEntity();
    ormEntity.id = entity.id;
    ormEntity.meetingId = entity.meetingId;
    ormEntity.title = entity.title;
    ormEntity.url = entity.url;
    ormEntity.type = entity.type;
    ormEntity.description = entity.description;
    ormEntity.uploadedBy = entity.uploadedBy;
    ormEntity.createdAt = entity.createdAt;
    ormEntity.updatedAt = entity.updatedAt || entity.createdAt;
    return ormEntity;
  }
}
