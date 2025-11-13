import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../../../../domain/entities/report.entity';
import { IReportRepository } from '../../../../domain/repositories/report.repository.interface';
import { ReportStatus } from '../../../../domain/enums/report-status.enum';
import { ReportOrmEntity } from '../entities/report.orm-entity';
import { ReportMapper } from '../mappers/report.mapper';

@Injectable()
export class ReportRepository implements IReportRepository {
  constructor(
    @InjectRepository(ReportOrmEntity)
    private ormRepository: Repository<ReportOrmEntity>,
  ) {}

  async save(report: Report): Promise<void> {
    const orm = ReportMapper.toPersistence(report);
    await this.ormRepository.save(orm);
  }

  async findById(id: string): Promise<Report | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? ReportMapper.toDomain(orm) : null;
  }

  async findByTargetUserId(userId: string, limit: number, offset: number): Promise<Report[]> {
    const orms = await this.ormRepository.find({
      where: { targetUserId: userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return orms.map(orm => ReportMapper.toDomain(orm));
  }

  async findByTargetContentId(contentId: string): Promise<Report[]> {
    const orms = await this.ormRepository.find({
      where: { targetContentId: contentId },
      order: { createdAt: 'DESC' },
    });
    return orms.map(orm => ReportMapper.toDomain(orm));
  }

  async findByStatus(status: ReportStatus, limit: number, offset: number): Promise<Report[]> {
    const orms = await this.ormRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return orms.map(orm => ReportMapper.toDomain(orm));
  }

  async findAll(limit: number, offset: number): Promise<Report[]> {
    const orms = await this.ormRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return orms.map(orm => ReportMapper.toDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async countByStatus(status: ReportStatus): Promise<number> {
    return this.ormRepository.countBy({ status });
  }

  async countAll(): Promise<number> {
    return this.ormRepository.count();
  }
}
