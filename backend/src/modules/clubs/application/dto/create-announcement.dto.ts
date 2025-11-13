import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export enum AnnouncementScopeDto {
  CLUB_ONLY = 'CLUB_ONLY',
  PUBLIC = 'PUBLIC',
}

export class CreateAnnouncementDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsEnum(AnnouncementScopeDto)
  scope: AnnouncementScopeDto;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
