import { IsString, IsOptional, IsUrl, IsEnum, IsBoolean } from 'class-validator';
import { ClubVisibility } from 'src/modules/clubs/domain/enums/club-visibility.enum';

export class UpdateClubDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsEnum(ClubVisibility)
  visibility?: ClubVisibility;

  @IsOptional()
  @IsString()
  manifesto?: string;

  @IsOptional()
  @IsUrl()
  slackUrl?: string;

  @IsOptional()
  @IsUrl()
  discordUrl?: string;

  @IsOptional()
  @IsBoolean()
  darkThemeEnabled?: boolean;
}
