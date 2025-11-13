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
import { ClubOrmEntity } from './club.orm-entity';
import { ClubRoleOrmEntity } from './club-role.orm-entity';

@Entity('club_members')
@Index(['clubId', 'userId'], { unique: true })
@Index(['tenantId'])
export class ClubMemberOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('bigint', { name: 'tenant_id', nullable: true })
  tenantId: number;

  @Column('uuid')
  clubId: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  roleId: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'REMOVED'],
    default: 'PENDING',
  })
  status: string;

  @Column('timestamp', { nullable: true })
  joinedAt?: Date;

  @Column('timestamp', { nullable: true })
  appliedAt?: Date;

  @Column('timestamp', { nullable: true })
  approvedAt?: Date;

  @Column('uuid', { nullable: true })
  approvedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ClubOrmEntity, (club) => club.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clubId' })
  club: ClubOrmEntity;

  @ManyToOne(() => ClubRoleOrmEntity, (role) => role.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: ClubRoleOrmEntity;
}
