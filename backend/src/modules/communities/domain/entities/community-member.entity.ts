import { BaseEntity } from 'src/shared/domain/base-entity';
import { CommunityMemberStatus } from '../enums/community-member-status.enum';
import { v4 as uuidv4 } from 'uuid';

interface CommunityMemberProps {
  communityId: string;
  userId: string;
  status: CommunityMemberStatus;
  appliedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export class CommunityMember extends BaseEntity {
  private props: CommunityMemberProps;

  private constructor(
    id: string,
    props: CommunityMemberProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get communityId(): string {
    return this.props.communityId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get status(): CommunityMemberStatus {
    return this.props.status;
  }

  get appliedAt(): Date {
    return this.props.appliedAt;
  }

  get approvedAt(): Date | undefined {
    return this.props.approvedAt;
  }

  get approvedBy(): string | undefined {
    return this.props.approvedBy;
  }

  public approve(adminId: string): void {
    if (this.props.status !== CommunityMemberStatus.PENDING) {
      throw new Error('Only pending members can be approved');
    }
    this.props.status = CommunityMemberStatus.ACTIVE;
    this.props.approvedAt = new Date();
    this.props.approvedBy = adminId;
    this.updatedAt = new Date();
  }

  public reject(): void {
    if (this.props.status !== CommunityMemberStatus.PENDING) {
      throw new Error('Only pending members can be rejected');
    }
    this.props.status = CommunityMemberStatus.REMOVED;
    this.updatedAt = new Date();
  }

  public suspend(): void {
    if (this.props.status !== CommunityMemberStatus.ACTIVE) {
      throw new Error('Only active members can be suspended');
    }
    this.props.status = CommunityMemberStatus.SUSPENDED;
    this.updatedAt = new Date();
  }

  public reactivate(): void {
    if (this.props.status !== CommunityMemberStatus.SUSPENDED) {
      throw new Error('Only suspended members can be reactivated');
    }
    this.props.status = CommunityMemberStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  public remove(): void {
    this.props.status = CommunityMemberStatus.REMOVED;
    this.updatedAt = new Date();
  }

  public isPending(): boolean {
    return this.props.status === CommunityMemberStatus.PENDING;
  }

  public isActive(): boolean {
    return this.props.status === CommunityMemberStatus.ACTIVE;
  }

  public static create(props: {
    communityId: string;
    userId: string;
  }): CommunityMember {
    const memberId = uuidv4();
    return new CommunityMember(memberId, {
      communityId: props.communityId,
      userId: props.userId,
      status: CommunityMemberStatus.PENDING,
      appliedAt: new Date(),
    });
  }

  public static restore(
    id: string,
    props: CommunityMemberProps,
    createdAt: Date,
    updatedAt?: Date,
  ): CommunityMember {
    return new CommunityMember(id, props, createdAt, updatedAt);
  }
}
