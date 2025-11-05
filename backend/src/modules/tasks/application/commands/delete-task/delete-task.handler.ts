import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteTaskCommand } from './delete-task.command';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';

@CommandHandler(DeleteTaskCommand)
export class DeleteTaskHandler implements ICommandHandler<DeleteTaskCommand> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(command: DeleteTaskCommand): Promise<void> {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.canBeDeletedBy(command.userId)) {
      throw new ForbiddenException('Only the assigner can delete this task');
    }

    // Cascading deletes are handled by TypeORM (comments, logs, subtasks, task-tags)
    await this.taskRepository.delete(command.taskId);
  }
}
