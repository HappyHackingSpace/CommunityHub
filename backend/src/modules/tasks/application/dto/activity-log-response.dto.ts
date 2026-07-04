import { ActivityLog } from '../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../domain/enums/activity-action.enum';

export class ActivityLogResponseDto {
  id: string;
  taskId: string;
  userId: string;
  action: ActivityAction;
  details?: Record<string, any>;
  createdAt: Date;

  static fromDomain(log: ActivityLog): ActivityLogResponseDto {
    return {
      id: log.id,
      taskId: log.taskId,
      userId: log.userId,
      action: log.action,
      details: log.getParsedDetails() || undefined,
      createdAt: log.createdAt,
    };
  }
}
