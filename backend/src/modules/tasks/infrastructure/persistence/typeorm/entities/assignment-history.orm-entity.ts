import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TaskOrmEntity } from './task.orm-entity';

@Entity('assignment_history')
export class AssignmentHistoryOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ name: 'task_id' })
  taskId: string;

  @Column({ name: 'assigned_by' })
  assignedBy: string;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo?: string;

  @Column({ name: 'previous_assignee', nullable: true })
  previousAssignee?: string;

  @ManyToOne(() => TaskOrmEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: TaskOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
