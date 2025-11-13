import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ActivityAction } from '../../../../domain/enums/activity-action.enum';
import { TaskOrmEntity } from './task.orm-entity';

@Entity('activity_logs')
@Index(['tenantId'])
export class ActivityLogOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('bigint', { name: 'tenant_id', nullable: true })
  tenantId: number;

  @Column({ name: 'task_id' })
  taskId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ActivityAction,
  })
  action: ActivityAction;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @ManyToOne(() => TaskOrmEntity, (task) => task.activityLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: TaskOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
