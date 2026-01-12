import { CommunityVisibility } from 'src/modules/communities/domain/enums/community-visibility.enum';

export class CommunityResponseDto {
  id: string;
  name: string;
  description: string;
  visibility: CommunityVisibility;
  founderId: string;
  logoUrl?: string;
  websiteUrl?: string;
  tenantId?: number;
  createdAt: Date;
  updatedAt: Date;
}
