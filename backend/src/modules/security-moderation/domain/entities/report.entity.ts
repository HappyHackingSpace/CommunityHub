import { BaseEntity } from '../../../../shared/domain/base-entity';
import { ReportStatus } from '../enums/report-status.enum';
import { ReportReason } from '../enums/report-reason.enum';

interface ReportProps {
  reporterId: string;
  targetUserId?: string;
  targetContentId?: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  moderatorId?: string;
  resolutionNotes?: string;
}

export class Report extends BaseEntity {
  private props: ReportProps;

  private constructor(
    id: string,
    props: ReportProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get reporterId(): string {
    return this.props.reporterId;
  }

  get targetUserId(): string | undefined {
    return this.props.targetUserId;
  }

  get targetContentId(): string | undefined {
    return this.props.targetContentId;
  }

  get reason(): ReportReason {
    return this.props.reason;
  }

  get description(): string {
    return this.props.description;
  }

  get status(): ReportStatus {
    return this.props.status;
  }

  get moderatorId(): string | undefined {
    return this.props.moderatorId;
  }

  get resolutionNotes(): string | undefined {
    return this.props.resolutionNotes;
  }

  public static create(props: {
    reporterId: string;
    targetUserId?: string;
    targetContentId?: string;
    reason: ReportReason;
    description: string;
  }): Report {
    const id = this.generateId();
    return new Report(id, {
      reporterId: props.reporterId,
      targetUserId: props.targetUserId,
      targetContentId: props.targetContentId,
      reason: props.reason,
      description: props.description,
      status: ReportStatus.OPEN,
    });
  }

  public static restore(
    id: string,
    props: ReportProps,
    createdAt: Date,
    updatedAt?: Date,
  ): Report {
    return new Report(id, props, createdAt, updatedAt);
  }

  public markUnderReview(moderatorId: string): void {
    this.props.moderatorId = moderatorId;
    this.props.status = ReportStatus.UNDER_REVIEW;
    this.updatedAt = new Date();
  }

  public resolve(moderatorId: string, resolutionNotes: string): void {
    this.props.moderatorId = moderatorId;
    this.props.status = ReportStatus.RESOLVED;
    this.props.resolutionNotes = resolutionNotes;
    this.updatedAt = new Date();
  }

  public dismiss(moderatorId: string, resolutionNotes: string): void {
    this.props.moderatorId = moderatorId;
    this.props.status = ReportStatus.DISMISSED;
    this.props.resolutionNotes = resolutionNotes;
    this.updatedAt = new Date();
  }

  public escalate(moderatorId: string): void {
    this.props.moderatorId = moderatorId;
    this.props.status = ReportStatus.ESCALATED;
    this.updatedAt = new Date();
  }

  private static generateId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
