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

@Entity('agenda_items')
export class AgendaItemOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ name: 'meeting_id' })
  meetingId: string;

  @ManyToOne(() => MeetingOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meeting_id' })
  meeting: MeetingOrmEntity;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true })
  duration?: number;

  @Column({ type: 'int' })
  order: number;

  @Column({ name: 'presenter_id', nullable: true })
  presenterId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
