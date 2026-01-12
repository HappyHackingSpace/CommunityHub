import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ModerationAction } from '../../../../domain/enums/moderation-action.enum';

@Entity('user_bans')
@Index(['tenantId'])
@Index(['tenantId', 'userId', 'createdAt'])
export class UserBanOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('bigint', { name: 'tenant_id' })
  tenantId: number;

  @Column('varchar')
  userId: string;

  @Column('enum', { enum: ModerationAction })
  action: ModerationAction;

  @Column('text')
  reason: string;

  @Column('varchar')
  moderatorId: string;

  @Column('timestamp', { nullable: true })
  banUntil: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
