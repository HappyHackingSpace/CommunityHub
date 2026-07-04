import { ClubRole } from 'src/modules/clubs/domain/entities/club-role.entity';
import { ClubRoleType } from 'src/modules/clubs/domain/enums/club-role-type.enum';
import { ClubRoleOrmEntity } from '../entities/club-role.orm-entity';

export class ClubRoleMapper {
  public static toDomain(raw: ClubRoleOrmEntity): ClubRole {
    return ClubRole.restore(
      raw.id,
      {
        clubId: raw.clubId,
        name: raw.name,
        roleType: raw.roleType as ClubRoleType,
        permissions: raw.permissions,
        isCustom: raw.isCustom,
      },
      raw.createdAt,
      raw.updatedAt,
    );
  }

  public static toPersistence(role: ClubRole): Partial<ClubRoleOrmEntity> {
    return {
      id: role.id,
      clubId: role.clubId,
      name: role.name,
      roleType: role.roleType,
      permissions: role.permissions,
      isCustom: role.isCustom,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
