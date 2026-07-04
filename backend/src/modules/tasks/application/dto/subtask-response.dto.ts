import { SubTask } from '../../domain/entities/subtask.entity';
import { TaskStatus } from '../../domain/enums/task-status.enum';

export class SubTaskResponseDto {
  id: string;
  parentId: string;
  title: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(subTask: SubTask): SubTaskResponseDto {
    return {
      id: subTask.id,
      parentId: subTask.parentId,
      title: subTask.title,
      status: subTask.status,
      createdAt: subTask.createdAt,
      updatedAt: subTask.updatedAt,
    };
  }
}
