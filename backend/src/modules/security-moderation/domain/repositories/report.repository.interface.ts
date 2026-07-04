import { Report } from '../entities/report.entity';
import { ReportStatus } from '../enums/report-status.enum';

export interface IReportRepository {
  save(report: Report): Promise<void>;
  findById(id: string): Promise<Report | null>;
  findByTargetUserId(userId: string, limit: number, offset: number): Promise<Report[]>;
  findByTargetContentId(contentId: string): Promise<Report[]>;
  findByStatus(status: ReportStatus, limit: number, offset: number): Promise<Report[]>;
  findAll(limit: number, offset: number): Promise<Report[]>;
  delete(id: string): Promise<void>;
  countByStatus(status: ReportStatus): Promise<number>;
  countAll(): Promise<number>;
}
