import { IsString, IsOptional, IsUrl, IsEnum } from 'class-validator';
import { ClubVisibility } from 'src/modules/clubs/domain/enums/club-visibility.enum';

export class CreateClubDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

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
}
