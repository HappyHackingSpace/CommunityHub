import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetActivityLogsQuery } from './get-activity-logs.query';
import { ActivityLogResponseDto } from '../../dto/activity-log-response.dto';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';

@QueryHandler(GetActivityLogsQuery)
export class GetActivityLogsHandler
  implements IQueryHandler<GetActivityLogsQuery>
{
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
  ) {}

  async execute(query: GetActivityLogsQuery): Promise<ActivityLogResponseDto[]> {
    const task = await this.taskRepository.findById(query.taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.canBeViewedBy(query.userId)) {
      throw new ForbiddenException('You cannot view activity logs for this task');
    }

    const logs = await this.activityLogRepository.findByTaskId(query.taskId);
    return logs.map((log) => ActivityLogResponseDto.fromDomain(log));
  }
}
