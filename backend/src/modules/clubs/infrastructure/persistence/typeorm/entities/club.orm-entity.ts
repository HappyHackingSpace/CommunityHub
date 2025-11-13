import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { ClubMemberOrmEntity } from './club-member.orm-entity';
import { ClubRoleOrmEntity } from './club-role.orm-entity';
import { ClubAnnouncementOrmEntity } from './club-announcement.orm-entity';

@Entity('clubs')
@Index(['tenantId'], { unique: true })
@Index(['tenantApiKey'], { unique: true })
export class ClubOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('bigint', { unique: true })
  tenantId: number;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 500 })
  description: string;

  @Column('varchar', { nullable: true })
  logoUrl?: string;

  @Column({
    type: 'enum',
    enum: ['PUBLIC', 'PRIVATE'],
    default: 'PUBLIC',
  })
  visibility: string;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  leaders: string[];

  @Column('text', { nullable: true })
  manifesto?: string;

  @Column('varchar', { nullable: true })
  slackUrl?: string;

  @Column('varchar', { nullable: true })
  discordUrl?: string;

  @Column('boolean', { default: false })
  darkThemeEnabled: boolean;

  @Column('integer', { default: 0 })
  totalTasksCompleted: number;

  @Column('integer', { default: 0 })
  totalMeetingsHeld: number;

  @Column('uuid')
  createdByUserId: string;

  @Column('varchar', { length: 255, nullable: true })
  tenantApiKey?: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('varchar', { length: 50, default: 'free' })
  tier: string;

  @Column('integer', { default: 50 })
  maxMembers: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ClubMemberOrmEntity, (member) => member.club, {
    cascade: true,
  })
  members: ClubMemberOrmEntity[];

  @OneToMany(() => ClubRoleOrmEntity, (role) => role.club, {
    cascade: true,
  })
  roles: ClubRoleOrmEntity[];

  @OneToMany(() => ClubAnnouncementOrmEntity, (announcement) => announcement.club, {
    cascade: true,
  })
  announcements: ClubAnnouncementOrmEntity[];
}
