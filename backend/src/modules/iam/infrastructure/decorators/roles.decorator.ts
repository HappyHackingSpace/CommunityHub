// src/shared/infrastructure/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../../domain/enums/role-type.enum';

export const Roles = (...roles: RoleType[]) => SetMetadata('roles', roles);