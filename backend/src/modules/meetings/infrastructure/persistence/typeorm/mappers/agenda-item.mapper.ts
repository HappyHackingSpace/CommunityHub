import { AgendaItem } from '../../../../domain/entities/agenda-item.entity';
import { AgendaItemOrmEntity } from '../entities/agenda-item.orm-entity';

export class AgendaItemMapper {
  static toDomain(ormEntity: AgendaItemOrmEntity): AgendaItem {
    return AgendaItem.restore(
      ormEntity.id,
      {
        meetingId: ormEntity.meetingId,
        title: ormEntity.title,
        description: ormEntity.description,
        duration: ormEntity.duration,
        order: ormEntity.order,
        presenter: ormEntity.presenterId,
      },
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  static toOrm(entity: AgendaItem): AgendaItemOrmEntity {
    const ormEntity = new AgendaItemOrmEntity();
    ormEntity.id = entity.id;
    ormEntity.meetingId = entity.meetingId;
    ormEntity.title = entity.title;
    ormEntity.description = entity.description;
    ormEntity.duration = entity.duration;
    ormEntity.order = entity.order;
    ormEntity.presenterId = entity.presenter;
    ormEntity.createdAt = entity.createdAt;
    ormEntity.updatedAt = entity.updatedAt || entity.createdAt;
    return ormEntity;
  }
}
