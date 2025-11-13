import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ClubOrmEntity } from './club.orm-entity';
import { ClubMemberOrmEntity } from './club-member.orm-entity';

@Entity('club_roles')
export class ClubRoleOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  clubId: string;

  @Column('varchar', { length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: ['LEADER', 'MEMBER', 'MODERATOR', 'CUSTOM'],
    default: 'MEMBER',
  })
  roleType: string;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  permissions: string[];

  @Column('boolean', { default: false })
  isCustom: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ClubOrmEntity, (club) => club.roles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clubId' })
  club: ClubOrmEntity;

  @OneToMany(() => ClubMemberOrmEntity, (member) => member.role)
  members: ClubMemberOrmEntity[];
}
