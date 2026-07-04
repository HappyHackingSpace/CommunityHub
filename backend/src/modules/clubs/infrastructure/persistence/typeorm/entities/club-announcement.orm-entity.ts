import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClubOrmEntity } from './club.orm-entity';

@Entity('club_announcements')
export class ClubAnnouncementOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  clubId: string;

  @Column('uuid')
  authorId: string;

  @Column('varchar', { length: 200 })
  title: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: ['CLUB_ONLY', 'PUBLIC'],
    default: 'CLUB_ONLY',
  })
  scope: string;

  @Column('boolean', { default: false })
  isPinned: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ClubOrmEntity, (club) => club.announcements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clubId' })
  club: ClubOrmEntity;
}
