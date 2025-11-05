import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { TaskStatus } from '../../../../domain/enums/task-status.enum';
import { TaskVisibility } from '../../../../domain/enums/task-visibility.enum';
import { CommentOrmEntity } from './comment.orm-entity';
import { ActivityLogOrmEntity } from './activity-log.orm-entity';
import { SubTaskOrmEntity } from './subtask.orm-entity';
import { TagOrmEntity } from './tag.orm-entity';

@Entity('tasks')
export class TaskOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskVisibility,
    default: TaskVisibility.PRIVATE,
  })
  visibility: TaskVisibility;

  @Column({ name: 'assigner_id' })
  assignerId: string;

  @Column({ name: 'assignee_id', nullable: true })
  assigneeId?: string;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate?: Date;

  @OneToMany(() => CommentOrmEntity, (comment) => comment.task, {
    cascade: true,
  })
  comments: CommentOrmEntity[];

  @OneToMany(() => ActivityLogOrmEntity, (log) => log.task, {
    cascade: true,
  })
  activityLogs: ActivityLogOrmEntity[];

  @OneToMany(() => SubTaskOrmEntity, (subtask) => subtask.parent, {
    cascade: true,
  })
  subTasks: SubTaskOrmEntity[];

  @ManyToMany(() => TagOrmEntity, (tag) => tag.tasks)
  @JoinTable({
    name: 'task_tags',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: TagOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
