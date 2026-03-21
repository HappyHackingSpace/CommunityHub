import { UserStatus } from 'src/modules/iam/domain/enums/user-status.enum';
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('users')
@Index(['globalRole'])
@Index(['primaryTenantId'])
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'google_id' })
  googleId: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ nullable: true, name: 'avatar_url' })
  avatarUrl?: string;

  @Column({ nullable: true, type: 'text' })
  bio?: string;

  @Column({
    type: 'simple-array',
  })
  roles: string[];

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column('varchar', { length: 50, default: 'ADMIN', name: 'global_role' })
  globalRole: string;

  @Column('uuid', { nullable: true, name: 'primary_tenant_id' })
  primaryTenantId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}