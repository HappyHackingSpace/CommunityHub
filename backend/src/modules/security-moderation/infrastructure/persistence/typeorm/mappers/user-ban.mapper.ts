import { UserBan } from '../../../../domain/entities/user-ban.entity';
import { UserBanOrmEntity } from '../entities/user-ban.orm-entity';

export class UserBanMapper {
  public static toDomain(raw: UserBanOrmEntity): UserBan {
    return UserBan.restore(raw.id, {
      userId: raw.userId,
      action: raw.action,
      reason: raw.reason,
      moderatorId: raw.moderatorId,
      banUntil: raw.banUntil || undefined,
    }, raw.createdAt, raw.updatedAt);
  }

  public static toPersistence(entity: UserBan): UserBanOrmEntity {
    const orm = new UserBanOrmEntity();
    orm.id = entity.id;
    orm.userId = entity.userId;
    orm.action = entity.action;
    orm.reason = entity.reason;
    orm.moderatorId = entity.moderatorId;
    orm.banUntil = entity.banUntil || null;
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }
}
