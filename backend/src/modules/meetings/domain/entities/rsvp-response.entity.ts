import { BaseEntity } from '../../../../shared/domain/base-entity';
import { RsvpStatus } from '../enums/rsvp-status.enum';

interface RsvpResponseProps {
  meetingId: string;
  userId: string;
  status: RsvpStatus;
  respondedAt?: Date;
  notes?: string;
}

export class RsvpResponse extends BaseEntity {
  private props: RsvpResponseProps;

  private constructor(
    id: string,
    props: RsvpResponseProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get meetingId(): string {
    return this.props.meetingId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get status(): RsvpStatus {
    return this.props.status;
  }

  get respondedAt(): Date | undefined {
    return this.props.respondedAt;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  public static create(props: {
    meetingId: string;
    userId: string;
    status: RsvpStatus;
    notes?: string;
  }): RsvpResponse {
    const rsvpId = this.generateId();
    const respondedAt = props.status !== RsvpStatus.NO_RESPONSE ? new Date() : undefined;

    return new RsvpResponse(rsvpId, {
      meetingId: props.meetingId,
      userId: props.userId,
      status: props.status,
      respondedAt,
      notes: props.notes,
    });
  }

  public static restore(
    id: string,
    props: RsvpResponseProps,
    createdAt: Date,
    updatedAt?: Date
  ): RsvpResponse {
    return new RsvpResponse(id, props, createdAt, updatedAt);
  }

  public updateStatus(status: RsvpStatus, notes?: string): void {
    this.props.status = status;
    this.props.respondedAt = status !== RsvpStatus.NO_RESPONSE ? new Date() : undefined;

    if (notes !== undefined) {
      this.props.notes = notes;
    }

    this.updatedAt = new Date();
  }

  private static generateId(): string {
    return `rsvp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
