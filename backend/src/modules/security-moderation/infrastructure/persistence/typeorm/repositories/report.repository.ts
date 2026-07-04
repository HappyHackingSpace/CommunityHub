import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { Report } from '../../../../domain/entities/report.entity';
import { IReportRepository } from '../../../../domain/repositories/report.repository.interface';
import { ReportStatus } from '../../../../domain/enums/report-status.enum';
import { ReportOrmEntity } from '../entities/report.orm-entity';
import { ReportMapper } from '../mappers/report.mapper';
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';

@Injectable()
export class ReportRepository implements IReportRepository {
  constructor(
    @InjectRepository(ReportOrmEntity)
    private ormRepository: Repository<ReportOrmEntity>,
    private cls: ClsService,
  ) {}

  protected getTenantId(): string {
    const tenantContext = this.cls.get<TenantContext>(TENANT_CONTEXT_KEY);
    if (!tenantContext || !tenantContext.tenantId) {
      throw new Error('Tenant context is not set');
    }
    return tenantContext.tenantId;
  }

  protected createTenantQueryBuilder(alias: string) {
    const tenantId = this.getTenantId();
    return this.ormRepository
      .createQueryBuilder(alias)
      .where(`${alias}.tenantId = :tenantId`, { tenantId });
  }

  async save(report: Report): Promise<void> {
    const orm = ReportMapper.toPersistence(report);
    const tenantId = this.getTenantId();
    (orm as any).tenantId = tenantId;
    await this.ormRepository.save(orm);
  }

  async findById(id: string): Promise<Report | null> {
    const orm = await this.createTenantQueryBuilder('report')
      .andWhere('report.id = :id', { id })
      .getOne();
    return orm ? ReportMapper.toDomain(orm) : null;
  }

  async findByTargetUserId(userId: string, limit: number, offset: number): Promise<Report[]> {
    const orms = await this.createTenantQueryBuilder('report')
      .andWhere('report.targetUserId = :userId', { userId })
      .orderBy('report.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
    return orms.map(orm => ReportMapper.toDomain(orm));
  }

  async findByTargetContentId(contentId: string): Promise<Report[]> {
    const orms = await this.createTenantQueryBuilder('report')
      .andWhere('report.targetContentId = :contentId', { contentId })
      .orderBy('report.createdAt', 'DESC')
      .getMany();
    return orms.map(orm => ReportMapper.toDomain(orm));
  }

  async findByStatus(status: ReportStatus, limit: number, offset: number): Promise<Report[]> {
    const orms = await this.createTenantQueryBuilder('report')
      .andWhere('report.status = :status', { status })
      .orderBy('report.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
    return orms.map(orm => ReportMapper.toDomain(orm));
  }

  async findAll(limit: number, offset: number): Promise<Report[]> {
    const orms = await this.createTenantQueryBuilder('report')
      .orderBy('report.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
    return orms.map(orm => ReportMapper.toDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.createTenantQueryBuilder('report')
      .delete()
      .andWhere('report.id = :id', { id })
      .execute();
  }

  async countByStatus(status: ReportStatus): Promise<number> {
    return this.createTenantQueryBuilder('report')
      .andWhere('report.status = :status', { status })
      .getCount();
  }

  async countAll(): Promise<number> {
    return this.createTenantQueryBuilder('report')
      .getCount();
  }
}
