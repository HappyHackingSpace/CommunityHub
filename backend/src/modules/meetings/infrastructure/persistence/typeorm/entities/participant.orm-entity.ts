import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ParticipantStatus } from '../../../../domain/enums/participant-status.enum';
import { MeetingOrmEntity } from './meeting.orm-entity';

@Entity('meeting_participants')
export class ParticipantOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'meeting_id' })
  meetingId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ParticipantStatus,
    default: ParticipantStatus.INVITED,
  })
  status: ParticipantStatus;

  @Column({ name: 'joined_at', type: 'timestamp', nullable: true })
  joinedAt?: Date;

  @ManyToOne(() => MeetingOrmEntity, meeting => meeting.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'meeting_id' })
  meeting: MeetingOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}