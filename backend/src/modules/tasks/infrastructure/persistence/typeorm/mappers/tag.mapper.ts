import { Tag } from '../../../../domain/entities/tag.entity';
import { TagOrmEntity } from '../entities/tag.orm-entity';
import { TagName } from '../../../../domain/value-objects/tag-name.vo';

export class TagMapper {
  static toPersistence(tag: Tag): TagOrmEntity {
    const ormEntity = new TagOrmEntity();
    ormEntity.id = tag.id;
    ormEntity.name = tag.name.value;
    ormEntity.color = tag.color;
    ormEntity.createdAt = tag.createdAt;
    ormEntity.updatedAt = tag.updatedAt;
    return ormEntity;
  }

  static toDomain(ormEntity: TagOrmEntity): Tag {
    return Tag.restore(
      ormEntity.id,
      {
        name: TagName.create(ormEntity.name),
        color: ormEntity.color,
      },
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }
}
