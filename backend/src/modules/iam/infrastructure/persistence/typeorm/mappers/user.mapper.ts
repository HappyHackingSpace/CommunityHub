import { User } from '../../../../domain/entities/user.entity';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { RoleType } from '../../../../domain/enums/role-type.enum';

export class UserMapper {
  static toPersistence(user: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();

    ormEntity.id = user.id;
    ormEntity.googleId = user.googleId.value;
    ormEntity.email = user.email;
    ormEntity.displayName = user.displayName.value;
    ormEntity.avatarUrl = user.avatarUrl;
    ormEntity.bio = user.bio;
    ormEntity.roles = user.roles;
    ormEntity.status = user.status;
    ormEntity.createdAt = user.createdAt;
    ormEntity.updatedAt = user.updatedAt;
    ormEntity.primaryTenantId = user.primaryTenantId;

    return ormEntity;
  }

  static toDomain(ormEntity: UserOrmEntity): User {
    return User.restore(
      ormEntity.id,
      ormEntity.googleId,
      ormEntity.email,
      ormEntity.displayName,
      ormEntity.roles as RoleType[],
      ormEntity.status,
      ormEntity.avatarUrl,
      ormEntity.bio,
      ormEntity.createdAt,
      ormEntity.updatedAt,
      ormEntity.primaryTenantId,
    );
  }
}