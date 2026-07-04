import { ActivityLog } from '../entities/activity-log.entity';

export interface IActivityLogRepository {
  save(log: ActivityLog): Promise<ActivityLog>;
  findByTaskId(taskId: string): Promise<ActivityLog[]>;
  delete(id: string): Promise<void>;
}
