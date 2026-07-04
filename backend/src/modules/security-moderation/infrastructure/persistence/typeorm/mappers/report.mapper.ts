import { Report } from '../../../../domain/entities/report.entity';
import { ReportOrmEntity } from '../entities/report.orm-entity';

export class ReportMapper {
  public static toDomain(raw: ReportOrmEntity): Report {
    return Report.restore(raw.id, {
      reporterId: raw.reporterId,
      targetUserId: raw.targetUserId || undefined,
      targetContentId: raw.targetContentId || undefined,
      reason: raw.reason,
      description: raw.description,
      status: raw.status,
      moderatorId: raw.moderatorId || undefined,
      resolutionNotes: raw.resolutionNotes || undefined,
    }, raw.createdAt, raw.updatedAt);
  }

  public static toPersistence(entity: Report): ReportOrmEntity {
    const orm = new ReportOrmEntity();
    orm.id = entity.id;
    orm.reporterId = entity.reporterId;
    orm.targetUserId = entity.targetUserId || null;
    orm.targetContentId = entity.targetContentId || null;
    orm.reason = entity.reason;
    orm.description = entity.description;
    orm.status = entity.status;
    orm.moderatorId = entity.moderatorId || null;
    orm.resolutionNotes = entity.resolutionNotes || null;
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }
}
