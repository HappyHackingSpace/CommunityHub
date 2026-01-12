import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ActivityType } from '../../../../domain/enums/activity-type.enum';

interface ActivityMetadataProps {
  resourceId?: string;
  resourceType?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  additionalData?: Record<string, unknown>;
}

@Entity('activity_feed_items')
@Index(['tenantId'])
@Index(['tenantId', 'userId', 'createdAt'])
@Index(['tenantId', 'activityType', 'createdAt'])
export class ActivityFeedItemOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('bigint', { name: 'tenant_id' })
  tenantId: number;

  @Column('varchar')
  userId: string;

  @Column('enum', { enum: ActivityType })
  activityType: ActivityType;

  @Column('jsonb')
  metadata: ActivityMetadataProps;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
