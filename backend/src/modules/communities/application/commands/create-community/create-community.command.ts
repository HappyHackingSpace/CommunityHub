import { CommunityVisibility } from 'src/modules/communities/domain/enums/community-visibility.enum';

export class CreateCommunityCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly visibility: CommunityVisibility,
    public readonly founderId: string,
    public readonly logoUrl?: string,
    public readonly websiteUrl?: string,
    public readonly tenantId?: string,
  ) {}
}
