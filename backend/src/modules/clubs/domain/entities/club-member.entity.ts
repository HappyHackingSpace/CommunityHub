import { BaseEntity } from 'src/shared/domain/base-entity';
import { MembershipStatus } from '../enums/membership-status.enum';
import { v4 as uuidv4 } from 'uuid';

interface ClubMemberProps {
  clubId: string;
  userId: string;
  roleId: string;
  status: MembershipStatus;
  joinedAt?: Date;
  appliedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export class ClubMember extends BaseEntity {
  private props: ClubMemberProps;

  private constructor(
    id: string,
    props: ClubMemberProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get clubId(): string {
    return this.props.clubId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get roleId(): string {
    return this.props.roleId;
  }

  get status(): MembershipStatus {
    return this.props.status;
  }

  get joinedAt(): Date | undefined {
    return this.props.joinedAt;
  }

  get appliedAt(): Date | undefined {
    return this.props.appliedAt;
  }

  get approvedAt(): Date | undefined {
    return this.props.approvedAt;
  }

  get approvedBy(): string | undefined {
    return this.props.approvedBy;
  }

  public static create(props: {
    clubId: string;
    userId: string;
    roleId: string;
    status: MembershipStatus;
    joinedAt?: Date;
    appliedAt?: Date;
  }): ClubMember {
    const memberId = uuidv4();
    return new ClubMember(memberId, {
      clubId: props.clubId,
      userId: props.userId,
      roleId: props.roleId,
      status: props.status,
      joinedAt: props.joinedAt,
      appliedAt: props.appliedAt,
    });
  }

  public static restore(
    id: string,
    props: ClubMemberProps,
    createdAt: Date,
    updatedAt?: Date,
  ): ClubMember {
    return new ClubMember(id, props, createdAt, updatedAt);
  }

  public approve(approverId: string): void {
    if (this.props.status !== MembershipStatus.PENDING) {
      throw new Error('Only pending applications can be approved');
    }
    this.props.status = MembershipStatus.APPROVED;
    this.props.approvedAt = new Date();
    this.props.approvedBy = approverId;
    this.props.joinedAt = new Date();
    this.updatedAt = new Date();
  }

  public reject(): void {
    if (this.props.status !== MembershipStatus.PENDING) {
      throw new Error('Only pending applications can be rejected');
    }
    this.props.status = MembershipStatus.REJECTED;
    this.updatedAt = new Date();
  }

  public remove(): void {
    this.props.status = MembershipStatus.REMOVED;
    this.updatedAt = new Date();
  }

  public updateRole(roleId: string): void {
    this.props.roleId = roleId;
    this.updatedAt = new Date();
  }

  public isPending(): boolean {
    return this.props.status === MembershipStatus.PENDING;
  }

  public isApproved(): boolean {
    return this.props.status === MembershipStatus.APPROVED;
  }

  public isActive(): boolean {
    return this.props.status === MembershipStatus.APPROVED;
  }
}
