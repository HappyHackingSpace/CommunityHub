import { RoleType } from '../../domain/enums/role-type.enum';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { User } from '../../domain/entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  roles: RoleType[];
  status: UserStatus;
  primaryTenantId?: string;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName.value,
      avatarUrl: user.avatarUrl,
      roles: user.roles,
      status: user.status,
      primaryTenantId: user.primaryTenantId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}