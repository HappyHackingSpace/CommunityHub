import { IsString, IsEnum, IsOptional, IsBoolean, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AnnouncementScopeDto {
  CLUB_ONLY = 'CLUB_ONLY',
  PUBLIC = 'PUBLIC',
}

export class CreateAnnouncementDto {
  @ApiProperty({
    description: 'Title of the announcement',
    minLength: 3,
    maxLength: 200,
    example: 'New Monthly Event Scheduled',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Announcement title must be at least 3 characters' })
  @MaxLength(200, { message: 'Announcement title cannot exceed 200 characters' })
  title: string;

  @ApiProperty({
    description: 'Content of the announcement',
    minLength: 10,
    maxLength: 5000,
    example: 'We are pleased to announce the next club meeting...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Announcement content must be at least 10 characters' })
  @MaxLength(5000, { message: 'Announcement content cannot exceed 5000 characters' })
  content: string;

  @ApiProperty({
    description: 'Scope of the announcement visibility',
    enum: AnnouncementScopeDto,
    example: AnnouncementScopeDto.PUBLIC,
  })
  @IsEnum(AnnouncementScopeDto, { message: 'scope must be either CLUB_ONLY or PUBLIC' })
  scope: AnnouncementScopeDto;

  @ApiPropertyOptional({
    description: 'Whether to pin the announcement to the top',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
