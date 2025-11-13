import { ClubVisibility } from 'src/modules/clubs/domain/enums/club-visibility.enum';

export class ClubResponseDto {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  visibility: ClubVisibility;
  leaders: string[];
  manifesto?: string;
  slackUrl?: string;
  discordUrl?: string;
  darkThemeEnabled: boolean;
  totalTasksCompleted: number;
  totalMeetingsHeld: number;
  createdAt: Date;
  updatedAt: Date;
}
