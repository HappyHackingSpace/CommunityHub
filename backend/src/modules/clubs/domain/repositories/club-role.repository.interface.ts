import { ClubRole } from '../entities/club-role.entity';
import { ClubRoleType } from '../enums/club-role-type.enum';

export interface IClubRoleRepository {
  create(role: ClubRole): Promise<void>;
  findById(id: string): Promise<ClubRole | null>;
  findByClubAndName(clubId: string, name: string): Promise<ClubRole | null>;
  update(role: ClubRole): Promise<void>;
  delete(id: string): Promise<void>;
  findRolesByClub(clubId: string): Promise<ClubRole[]>;
  findRolesByClubAndType(
    clubId: string,
    roleType: ClubRoleType,
  ): Promise<ClubRole[]>;
  findCustomRolesByClub(clubId: string): Promise<ClubRole[]>;
}
