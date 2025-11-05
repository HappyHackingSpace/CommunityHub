import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetAssignmentHistoryQuery } from './get-assignment-history.query';
import { AssignmentHistoryResponseDto } from '../../dto/assignment-history-response.dto';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { IAssignmentHistoryRepository } from '../../../domain/repositories/assignment-history.repository.interface';

@QueryHandler(GetAssignmentHistoryQuery)
export class GetAssignmentHistoryHandler
  implements IQueryHandler<GetAssignmentHistoryQuery>
{
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IAssignmentHistoryRepository')
    private readonly assignmentHistoryRepository: IAssignmentHistoryRepository,
  ) {}

  async execute(
    query: GetAssignmentHistoryQuery,
  ): Promise<AssignmentHistoryResponseDto[]> {
    const task = await this.taskRepository.findById(query.taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.canBeViewedBy(query.userId)) {
      throw new ForbiddenException(
        'You cannot view assignment history for this task',
      );
    }

    const history = await this.assignmentHistoryRepository.findByTaskId(
      query.taskId,
    );
    return history.map((h) => AssignmentHistoryResponseDto.fromDomain(h));
  }
}
