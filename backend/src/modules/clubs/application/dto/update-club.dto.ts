import { IsString, IsOptional, IsUrl, IsEnum, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClubVisibility } from 'src/modules/clubs/domain/enums/club-visibility.enum';

export class UpdateClubDto {
  @ApiPropertyOptional({
    description: 'Name of the club',
    minLength: 2,
    maxLength: 100,
    example: 'Updated Club Name',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Club name must be at least 2 characters' })
  @MaxLength(100, { message: 'Club name cannot exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the club',
    minLength: 10,
    maxLength: 1000,
    example: 'Updated club description',
  })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Club description must be at least 10 characters' })
  @MaxLength(1000, { message: 'Club description cannot exceed 1000 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'URL to the club logo image',
    example: 'https://example.com/new-logo.png',
  })
  @IsOptional()
  @IsUrl({}, { message: 'logoUrl must be a valid URL' })
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Visibility level of the club',
    enum: ClubVisibility,
    example: ClubVisibility.PUBLIC,
  })
  @IsOptional()
  @IsEnum(ClubVisibility)
  visibility?: ClubVisibility;

  @ApiPropertyOptional({
    description: 'Club manifesto or mission statement',
    maxLength: 2000,
    example: 'Updated manifesto text',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Club manifesto cannot exceed 2000 characters' })
  manifesto?: string;

  @ApiPropertyOptional({
    description: 'URL to the club Slack workspace',
    example: 'https://example.slack.com',
  })
  @IsOptional()
  @IsUrl({}, { message: 'slackUrl must be a valid URL' })
  slackUrl?: string;

  @ApiPropertyOptional({
    description: 'URL to the club Discord server',
    example: 'https://discord.gg/example',
  })
  @IsOptional()
  @IsUrl({}, { message: 'discordUrl must be a valid URL' })
  discordUrl?: string;

  @ApiPropertyOptional({
    description: 'Enable dark theme for the club',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  darkThemeEnabled?: boolean;
}
