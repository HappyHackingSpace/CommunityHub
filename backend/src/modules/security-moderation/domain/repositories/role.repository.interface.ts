import { Role } from '../entities/role.entity';
import { RoleType } from '../enums/role-type.enum';

export interface IRoleRepository {
  save(role: Role): Promise<void>;
  findById(id: string): Promise<Role | null>;
  findByRoleType(roleType: RoleType): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  delete(id: string): Promise<void>;
}
