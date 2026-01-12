import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CommunityOrmEntity } from './community.orm-entity';

@Entity('community_members')
@Index(['communityId', 'userId'], { unique: true })
@Index(['status'])
@Index(['appliedAt'])
export class CommunityMemberOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  communityId: string;

  @Column('uuid')
  userId: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'REMOVED'],
    default: 'PENDING',
  })
  status: string;

  @Column('timestamp')
  appliedAt: Date;

  @Column('timestamp', { nullable: true })
  approvedAt?: Date;

  @Column('uuid', { nullable: true })
  approvedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => CommunityOrmEntity, (community) => community.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'communityId' })
  community: CommunityOrmEntity;
}
