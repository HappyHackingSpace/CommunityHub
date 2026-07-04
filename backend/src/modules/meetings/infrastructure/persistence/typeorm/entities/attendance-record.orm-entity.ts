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

@Entity('attendance_records')
@Unique(['meetingId', 'userId']) // One attendance record per user per meeting
export class AttendanceRecordOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ name: 'meeting_id' })
  meetingId: string;

  @ManyToOne(() => MeetingOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meeting_id' })
  meeting: MeetingOrmEntity;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ default: false })
  attended: boolean;

  @Column({ name: 'joined_at', type: 'timestamp', nullable: true })
  joinedAt?: Date;

  @Column({ name: 'left_at', type: 'timestamp', nullable: true })
  leftAt?: Date;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
