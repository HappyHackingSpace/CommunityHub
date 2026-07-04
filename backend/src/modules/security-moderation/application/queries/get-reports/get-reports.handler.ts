import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetReportsQuery } from './get-reports.query';
import type { IReportRepository } from 'src/modules/security-moderation/domain/repositories/report.repository.interface';

export interface ReportDto {
  id: string;
  reporterId: string;
  targetUserId?: string;
  targetContentId?: string;
  reason: string;
  description: string;
  status: string;
  moderatorId?: string;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetReportsQuery)
export class GetReportsHandler implements IQueryHandler<GetReportsQuery> {
  constructor(
    @Inject('IReportRepository')
    private readonly repository: IReportRepository,
  ) {}

  async execute(query: GetReportsQuery): Promise<{ items: ReportDto[]; total: number }> {
    let reports;
    let total;

    if (query.status) {
      reports = await this.repository.findByStatus(query.status, query.limit, query.offset);
      total = await this.repository.countByStatus(query.status);
    } else {
      reports = await this.repository.findAll(query.limit, query.offset);
      total = await this.repository.countAll();
    }

    return {
      items: reports.map(report => ({
        id: report.id,
        reporterId: report.reporterId,
        targetUserId: report.targetUserId,
        targetContentId: report.targetContentId,
        reason: report.reason,
        description: report.description,
        status: report.status,
        moderatorId: report.moderatorId,
        resolutionNotes: report.resolutionNotes,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      })),
      total,
    };
  }
}
