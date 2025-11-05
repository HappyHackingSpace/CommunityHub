import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { TaskOrmEntity } from './task.orm-entity';

@Entity('tags')
export class TagOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 7, nullable: true })
  color?: string;

  @ManyToMany(() => TaskOrmEntity, (task) => task.tags)
  tasks: TaskOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
