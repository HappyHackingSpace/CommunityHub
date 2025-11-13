import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ClubRoleType } from 'src/modules/clubs/domain/enums/club-role-type.enum';

export class CreateClubRoleDto {
  @IsString()
  name: string;

  @IsEnum(ClubRoleType)
  roleType: ClubRoleType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
