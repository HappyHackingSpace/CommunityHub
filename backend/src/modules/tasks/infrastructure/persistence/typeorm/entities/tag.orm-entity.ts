import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  Index,
} from 'typeorm';
import { TaskOrmEntity } from './task.orm-entity';

@Entity('tags')
@Index(['tenantId', 'name'], { unique: true })
export class TagOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('uuid', { name: 'tenant_id', nullable: true })
  tenantId: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 7, nullable: true })
  color?: string;

  @Column('uuid', { name: 'club_id', nullable: true })
  clubId?: string;

  @ManyToMany(() => TaskOrmEntity, (task) => task.tags)
  tasks: TaskOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
