import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetRolesQuery } from './get-roles.query';
import type { IRoleRepository } from 'src/modules/security-moderation/domain/repositories/role.repository.interface';

export interface RoleDto {
  id: string;
  roleType: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetRolesQuery)
export class GetRolesHandler implements IQueryHandler<GetRolesQuery> {
  constructor(
    @Inject('IRoleRepository')
    private readonly repository: IRoleRepository,
  ) {}

  async execute(): Promise<RoleDto[]> {
    const roles = await this.repository.findAll();

    return roles.map(role => ({
      id: role.id,
      roleType: role.roleType,
      name: role.name,
      description: role.description,
      permissions: role.permissions.getAll(),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));
  }
}
