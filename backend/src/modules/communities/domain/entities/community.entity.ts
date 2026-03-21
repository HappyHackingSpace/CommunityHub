import { BaseEntity } from 'src/shared/domain/base-entity';
import { CommunityName } from '../value-objects/community-name.vo';
import { CommunityDescription } from '../value-objects/community-description.vo';
import { CommunityVisibility } from '../enums/community-visibility.enum';
import { v4 as uuidv4 } from 'uuid';

interface CommunityProps {
  name: CommunityName;
  description: CommunityDescription;
  visibility: CommunityVisibility;
  founderId: string;
  logoUrl?: string;
  websiteUrl?: string;
  tenantId?: string;
}

export class Community extends BaseEntity {
  private props: CommunityProps;

  private constructor(
    id: string,
    props: CommunityProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get name(): CommunityName {
    return this.props.name;
  }

  get description(): CommunityDescription {
    return this.props.description;
  }

  get visibility(): CommunityVisibility {
    return this.props.visibility;
  }

  get founderId(): string {
    return this.props.founderId;
  }

  get logoUrl(): string | undefined {
    return this.props.logoUrl;
  }

  get websiteUrl(): string | undefined {
    return this.props.websiteUrl;
  }

  get tenantId(): string | undefined {
    return this.props.tenantId;
  }


  public update(props: {
    name?: string;
    description?: string;
    visibility?: CommunityVisibility;
    logoUrl?: string;
    websiteUrl?: string;
  }): void {
    if (props.name !== undefined) {
      this.props.name = CommunityName.create(props.name);
    }
    if (props.description !== undefined) {
      this.props.description = CommunityDescription.create(props.description);
    }
    if (props.visibility !== undefined) {
      this.props.visibility = props.visibility;
    }
    if (props.logoUrl !== undefined) {
      this.props.logoUrl = props.logoUrl;
    }
    if (props.websiteUrl !== undefined) {
      this.props.websiteUrl = props.websiteUrl;
    }
    this.updatedAt = new Date();
  }

  public canBeModifiedBy(userId: string): boolean {
    return this.founderId === userId;
  }

  public static create(props: {
    name: string;
    description: string;
    visibility: CommunityVisibility;
    founderId: string;
    logoUrl?: string;
    websiteUrl?: string;
    tenantId?: string;
  }): Community {
    const communityId = uuidv4();
    return new Community(communityId, {
      name: CommunityName.create(props.name),
      description: CommunityDescription.create(props.description),
      visibility: props.visibility,
      founderId: props.founderId,
      logoUrl: props.logoUrl,
      websiteUrl: props.websiteUrl,
      tenantId: props.tenantId,
    });
  }

  public static restore(
    id: string,
    props: CommunityProps,
    createdAt: Date,
    updatedAt?: Date,
  ): Community {
    return new Community(id, props, createdAt, updatedAt);
  }
}
