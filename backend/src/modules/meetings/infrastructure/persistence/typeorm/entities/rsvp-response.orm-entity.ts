import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { MeetingOrmEntity } from './meeting.orm-entity';
import { RsvpStatus } from '../../../../domain/enums/rsvp-status.enum';

@Entity('rsvp_responses')
@Unique(['meetingId', 'userId']) // One RSVP per user per meeting
export class RsvpResponseOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ name: 'meeting_id' })
  meetingId: string;

  @ManyToOne(() => MeetingOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meeting_id' })
  meeting: MeetingOrmEntity;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: RsvpStatus,
    default: RsvpStatus.NO_RESPONSE,
  })
  status: RsvpStatus;

  @Column({ name: 'responded_at', type: 'timestamp', nullable: true })
  respondedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
