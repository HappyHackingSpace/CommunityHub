import { CommunityVisibility } from 'src/modules/communities/domain/enums/community-visibility.enum';

export class CreateCommunityDto {
  name: string;
  description: string;
  visibility: CommunityVisibility;
  logoUrl?: string;
  websiteUrl?: string;
}
