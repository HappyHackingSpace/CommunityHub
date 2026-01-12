import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { CommunityMemberOrmEntity } from './community-member.orm-entity';

@Entity('communities')
@Index(['tenantId'], { unique: true, where: '"tenantId" IS NOT NULL' })
@Index(['visibility'])
@Index(['founderId'])
export class CommunityOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 1000 })
  description: string;

  @Column({
    type: 'enum',
    enum: ['PUBLIC', 'PRIVATE', 'RESTRICTED'],
    default: 'PUBLIC',
  })
  visibility: string;

  @Column('uuid')
  founderId: string;

  @Column('varchar', { nullable: true })
  logoUrl?: string;

  @Column('varchar', { nullable: true })
  websiteUrl?: string;

  @Column('bigint', { nullable: true })
  tenantId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CommunityMemberOrmEntity, (member) => member.community, {
    cascade: true,
  })
  members: CommunityMemberOrmEntity[];
}
