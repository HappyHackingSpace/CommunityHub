import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { MeetingStatus } from '../../../../domain/enums/meeting-status.enum';
import { ParticipantOrmEntity } from './participant.orm-entity';

@Entity('meetings')
export class MeetingOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

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