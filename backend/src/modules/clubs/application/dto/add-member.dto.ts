import { IsUUID, IsOptional, IsUUID as IsUUIDConstraint } from 'class-validator';

export class AddMemberDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUIDConstraint()
  roleId?: string;
}
