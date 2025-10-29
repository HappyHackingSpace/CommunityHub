import { BaseEntity } from '../../../../shared/domain/base-entity';
import { MeetingTitle } from '../value-objects/meeting-title.vo';
import { MeetingDuration } from '../value-objects/meeting-duration.vo';
import { MeetingStatus } from '../enums/meeting-status.enum';
import { ParticipantStatus } from '../enums/participant-status.enum';
import { MeetingCreatedEvent } from '../events/meeting-created.event';
import { MeetingUpdatedEvent } from '../events/meeting-updated.event';
import { ParticipantAddedEvent } from '../events/participant-added.event';


interface Participant {
  userId: string;
  status: ParticipantStatus;
  joinedAt?: Date;
}

interface MeetingProps {
  title: MeetingTitle;
  description?: string;
  startTime: Date;
  duration: MeetingDuration;
  organizerId: string;
  participants: Participant[];
  status: MeetingStatus;
  meetingUrl?: string;
}

export class Meeting extends BaseEntity {
  private props: MeetingProps;
  private domainEvents: any[] = [];

  private constructor(id: string, props: MeetingProps, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get title(): MeetingTitle {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get startTime(): Date {
    return this.props.startTime;
  }

  get duration(): MeetingDuration {
    return this.props.duration;
  }

  get endTime(): Date {
    const endTime = new Date(this.props.startTime);
    endTime.setMinutes(endTime.getMinutes() + this.props.duration.minutes);
    return endTime;
  }

  get organizerId(): string {
    return this.props.organizerId;
  }

  get participants(): Participant[] {
    return [...this.props.participants];
  }

  get status(): MeetingStatus {
    return this.props.status;
  }

  get meetingUrl(): string | undefined {
    return this.props.meetingUrl;
  }

  get events(): any[] {
    return [...this.domainEvents];
  }

  public static create(props: {
    title: string;
    description?: string;
    startTime: Date;
    duration: number;
    organizerId: string;
    meetingUrl?: string;
  }): Meeting {
    const title = MeetingTitle.create(props.title);
    const duration = MeetingDuration.create(props.duration);
    
    this.validateMeetingTime(props.startTime);

    const meetingId = this.generateId();
    const meeting = new Meeting(meetingId, {
      title,
      description: props.description,
      startTime: props.startTime,
      duration,
      organizerId: props.organizerId,
      participants: [],
      status: MeetingStatus.SCHEDULED,
      meetingUrl: props.meetingUrl,
    });

    meeting.addDomainEvent(new MeetingCreatedEvent(meetingId, props.organizerId, props.startTime));
    return meeting;
  }

  public static restore(
    id: string,
    props: MeetingProps,
    createdAt: Date,
    updatedAt?: Date
  ): Meeting {
    return new Meeting(id, props, createdAt, updatedAt);
  }

  public updateMeeting(props: {
    title?: string;
    description?: string;
    startTime?: Date;
    duration?: number;
  }): void {
    this.ensureNotCompleted();

    if (props.title) {
      this.props.title = MeetingTitle.create(props.title);
    }

    if (props.description !== undefined) {
      this.props.description = props.description;
    }

    if (props.startTime) {
      Meeting.validateMeetingTime(props.startTime);
      this.props.startTime = props.startTime;
    }

    if (props.duration) {
      this.props.duration = MeetingDuration.create(props.duration);
    }

    this.updatedAt = new Date();
    this.addDomainEvent(new MeetingUpdatedEvent(this.id, this.props.organizerId));
  }

  public addParticipant(userId: string): void {
    this.ensureNotCompleted();
    
    if (this.isParticipantExists(userId)) {
      throw new Error('User is already a participant');
    }

    this.props.participants.push({
      userId,
      status: ParticipantStatus.INVITED,
    });

    this.addDomainEvent(new ParticipantAddedEvent(this.id, userId));
    this.updatedAt = new Date();
  }

  public acceptInvitation(userId: string): void {
    this.ensureNotCompleted();
    this.updateParticipantStatus(userId, ParticipantStatus.ACCEPTED);
  }

  public declineInvitation(userId: string): void {
    this.ensureNotCompleted();
    this.updateParticipantStatus(userId, ParticipantStatus.DECLINED);
  }

  public startMeeting(): void {
    if (this.props.status !== MeetingStatus.SCHEDULED) {
      throw new Error('Only scheduled meetings can be started');
    }

    this.props.status = MeetingStatus.IN_PROGRESS;
    this.updatedAt = new Date();
  }

  public completeMeeting(): void {
    if (this.props.status !== MeetingStatus.IN_PROGRESS) {
      throw new Error('Only in-progress meetings can be completed');
    }

    this.props.status = MeetingStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  public cancelMeeting(): void {
    this.ensureNotCompleted();
    this.props.status = MeetingStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  private updateParticipantStatus(userId: string, status: ParticipantStatus): void {
    const participant = this.props.participants.find(p => p.userId === userId);
    if (!participant) {
      throw new Error('User is not a participant');
    }

    participant.status = status;
    this.updatedAt = new Date();
  }

  private isParticipantExists(userId: string): boolean {
    return this.props.participants.some(p => p.userId === userId);
  }

  private ensureNotCompleted(): void {
    if (this.props.status === MeetingStatus.COMPLETED || this.props.status === MeetingStatus.CANCELLED) {
      throw new Error('Cannot modify completed or cancelled meeting');
    }
  }

  private static validateMeetingTime(startTime: Date): void {
    const now = new Date();
    if (startTime <= now) {
      throw new Error('Meeting start time must be in the future');
    }
  }

  private static generateId(): string {
    return `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addDomainEvent(event: any): void {
    this.domainEvents.push(event);
  }

  public clearEvents(): void {
    this.domainEvents = [];
  }
}
