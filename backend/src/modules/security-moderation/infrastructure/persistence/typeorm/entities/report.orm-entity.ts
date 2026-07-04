import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ReportStatus } from '../../../../domain/enums/report-status.enum';
import { ReportReason } from '../../../../domain/enums/report-reason.enum';

@Entity('reports')
@Index(['tenantId'])
@Index(['tenantId', 'reporterId', 'createdAt'])
@Index(['tenantId', 'status', 'createdAt'])
@Index(['tenantId', 'targetUserId'])
@Index(['tenantId', 'targetContentId'])
export class ReportOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('uuid', { name: 'tenant_id' })
  tenantId: string;

  @Column('varchar')
  reporterId: string;

  @Column('varchar', { nullable: true })
  targetUserId: string | null;

  @Column('varchar', { nullable: true })
  targetContentId: string | null;

  @Column('enum', { enum: ReportReason })
  reason: ReportReason;

  @Column('text')
  description: string;

  @Column('enum', { enum: ReportStatus, default: ReportStatus.OPEN })
  status: ReportStatus;

  @Column('varchar', { nullable: true })
  moderatorId: string | null;

  @Column('text', { nullable: true })
  resolutionNotes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
