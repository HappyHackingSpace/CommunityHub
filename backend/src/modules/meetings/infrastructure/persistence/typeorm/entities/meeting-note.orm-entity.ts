import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MeetingOrmEntity } from './meeting.orm-entity';

export type NoteType = 'note' | 'decision' | 'action_item';

@Entity('meeting_notes')
export class MeetingNoteOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ name: 'meeting_id' })
  meetingId: string;

  @ManyToOne(() => MeetingOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meeting_id' })
  meeting: MeetingOrmEntity;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    name: 'note_type',
    type: 'varchar',
    length: 20,
  })
  noteType: NoteType;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'is_converted_to_task', default: false })
  isConvertedToTask: boolean;

  @Column({ name: 'task_id', nullable: true })
  taskId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
