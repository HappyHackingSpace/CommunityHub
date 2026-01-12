import { CommunityVisibility } from 'src/modules/communities/domain/enums/community-visibility.enum';

export class UpdateCommunityCommand {
  constructor(
    public readonly communityId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly visibility?: CommunityVisibility,
    public readonly logoUrl?: string,
    public readonly websiteUrl?: string,
  ) {}
}
