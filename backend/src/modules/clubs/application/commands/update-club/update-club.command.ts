import { ClubVisibility } from 'src/modules/clubs/domain/enums/club-visibility.enum';

export class UpdateClubCommand {
  constructor(
    public readonly clubId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly logoUrl?: string,
    public readonly visibility?: ClubVisibility,
    public readonly manifesto?: string,
    public readonly slackUrl?: string,
    public readonly discordUrl?: string,
    public readonly darkThemeEnabled?: boolean,
  ) {}
}
