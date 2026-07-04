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
import { TaskOrmEntity } from './task.orm-entity';

@Entity('task_dependencies')
@Index(['taskId', 'dependsOnTaskId'], { unique: true })
export class TaskDependencyOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ name: 'task_id' })
  taskId: string;

  @Column({ name: 'depends_on_task_id' })
  dependsOnTaskId: string;

  @ManyToOne(() => TaskOrmEntity)
  @JoinColumn({ name: 'task_id' })
  task: TaskOrmEntity;

  @ManyToOne(() => TaskOrmEntity)
  @JoinColumn({ name: 'depends_on_task_id' })
  dependsOnTask: TaskOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
