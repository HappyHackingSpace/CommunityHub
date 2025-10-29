// src/modules/iam/application/dto/assign-role.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { RoleType } from '../../domain/enums/role-type.enum';

export class AssignRoleDto {
  @IsEnum(RoleType)
  @IsNotEmpty()
  role: RoleType;
}