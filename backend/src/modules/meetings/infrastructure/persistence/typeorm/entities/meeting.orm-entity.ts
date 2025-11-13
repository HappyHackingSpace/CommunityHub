import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { MeetingStatus } from '../../../../domain/enums/meeting-status.enum';
import { EventPrivacy } from '../../../../domain/enums/event-privacy.enum';
import { LocationType } from '../../../../domain/enums/location-type.enum';
import { ParticipantOrmEntity } from './participant.orm-entity';

@Entity('meetings')
@Index(['tenantId'])
@Index(['tenantId', 'clubId'])
@Index(['tenantId', 'startTime'])
export class MeetingOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('bigint', { name: 'tenant_id', nullable: true })
  tenantId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime?: Date;

  @Column({ name: 'duration_minutes' })
  durationMinutes: number;

  @Column({ name: 'organizer_id' })
  organizerId: string;

  @Column({
    type: 'enum',
    enum: MeetingStatus,
    default: MeetingStatus.SCHEDULED,
  })
  status: MeetingStatus;

  @Column({ name: 'meeting_url', nullable: true })
  meetingUrl?: string;

  @Column({ type: 'text', nullable: true })
  location?: string;

  @Column({
    name: 'location_type',
    type: 'enum',
    enum: LocationType,
    default: LocationType.ONLINE,
  })
  locationType: LocationType;

  @Column({
    type: 'enum',
    enum: EventPrivacy,
    default: EventPrivacy.PUBLIC,
  })
  privacy: EventPrivacy;

  @Column({ name: 'recurrence_rule', type: 'text', nullable: true })
  recurrenceRule?: string;

  @Column({ name: 'feedback_form_url', type: 'text', nullable: true })
  feedbackFormUrl?: string;

  @Column({ name: 'club_id', type: 'uuid', nullable: true })
  clubId?: string;

  @OneToMany(() => ParticipantOrmEntity, participant => participant.meeting, {
    cascade: true,
    eager: true,
  })
  participants: ParticipantOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}