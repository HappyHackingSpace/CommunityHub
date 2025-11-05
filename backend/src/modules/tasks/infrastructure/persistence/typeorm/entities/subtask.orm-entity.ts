import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TaskStatus } from '../../../../domain/enums/task-status.enum';
import { TaskOrmEntity } from './task.orm-entity';

@Entity('subtasks')
export class SubTaskOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ name: 'parent_id' })
  parentId: string;

  @Column({ length: 200 })
  title: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @ManyToOne(() => TaskOrmEntity, (task) => task.subTasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: TaskOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
