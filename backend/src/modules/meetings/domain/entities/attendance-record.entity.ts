import { BaseEntity } from '../../../../shared/domain/base-entity';

interface AttendanceRecordProps {
  meetingId: string;
  userId: string;
  attended: boolean;
  joinedAt?: Date;
  leftAt?: Date;
  durationMinutes?: number;
}

export class AttendanceRecord extends BaseEntity {
  private props: AttendanceRecordProps;

  private constructor(
    id: string,
    props: AttendanceRecordProps,
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

  get attended(): boolean {
    return this.props.attended;
  }

  get joinedAt(): Date | undefined {
    return this.props.joinedAt;
  }

  get leftAt(): Date | undefined {
    return this.props.leftAt;
  }

  get durationMinutes(): number | undefined {
    return this.props.durationMinutes;
  }

  public static create(props: {
    meetingId: string;
    userId: string;
    attended: boolean;
    joinedAt?: Date;
  }): AttendanceRecord {
    const recordId = this.generateId();
    return new AttendanceRecord(recordId, {
      meetingId: props.meetingId,
      userId: props.userId,
      attended: props.attended,
      joinedAt: props.joinedAt,
    });
  }

  public static restore(
    id: string,
    props: AttendanceRecordProps,
    createdAt: Date,
    updatedAt?: Date
  ): AttendanceRecord {
    return new AttendanceRecord(id, props, createdAt, updatedAt);
  }

  public markAsAttended(joinedAt: Date): void {
    this.props.attended = true;
    this.props.joinedAt = joinedAt;
    this.updatedAt = new Date();
  }

  public recordDeparture(leftAt: Date): void {
    if (!this.props.attended || !this.props.joinedAt) {
      throw new Error('Cannot record departure for user who did not join');
    }

    this.props.leftAt = leftAt;

    // Calculate duration in minutes
    const durationMs = leftAt.getTime() - this.props.joinedAt.getTime();
    this.props.durationMinutes = Math.floor(durationMs / 60000);

    this.updatedAt = new Date();
  }

  private static generateId(): string {
    return `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
