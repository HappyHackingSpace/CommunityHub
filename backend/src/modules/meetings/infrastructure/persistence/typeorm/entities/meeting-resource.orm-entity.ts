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
import { ResourceType } from '../../../../domain/enums/resource-type.enum';

@Entity('meeting_resources')
export class MeetingResourceOrmEntity {
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
  url: string;

  @Column({
    type: 'enum',
    enum: ResourceType,
    default: ResourceType.LINK,
  })
  type: ResourceType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'uploaded_by' })
  uploadedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
