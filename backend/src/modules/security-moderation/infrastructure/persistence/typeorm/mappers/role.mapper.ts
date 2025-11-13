import { Role } from '../../../../domain/entities/role.entity';
import { PermissionSet, Permission } from '../../../../domain/value-objects/permission.vo';
import { RoleOrmEntity } from '../entities/role.orm-entity';

export class RoleMapper {
  public static toDomain(raw: RoleOrmEntity): Role {
    const permissionSet = PermissionSet.create(raw.permissions);
    return Role.restore(raw.id, {
      roleType: raw.roleType,
      name: raw.name,
      description: raw.description,
      permissions: permissionSet,
    }, raw.createdAt, raw.updatedAt);
  }

  public static toPersistence(entity: Role): RoleOrmEntity {
    const orm = new RoleOrmEntity();
    orm.id = entity.id;
    orm.roleType = entity.roleType;
    orm.name = entity.name;
    orm.description = entity.description;
    orm.permissions = entity.permissions.getAll();
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }
}
