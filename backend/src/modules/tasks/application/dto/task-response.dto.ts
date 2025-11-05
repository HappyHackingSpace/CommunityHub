import { Task } from '../../domain/entities/task.entity';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { TaskVisibility } from '../../domain/enums/task-visibility.enum';
import { CommentResponseDto } from './comment-response.dto';
import { ActivityLogResponseDto } from './activity-log-response.dto';
import { SubTaskResponseDto } from './subtask-response.dto';
import { TagResponseDto } from './tag-response.dto';

export class TaskResponseDto {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  visibility: TaskVisibility;
  assignerId: string;
  assigneeId?: string;
  dueDate?: Date;
  comments?: CommentResponseDto[];
  activityLogs?: ActivityLogResponseDto[];
  subTasks?: SubTaskResponseDto[];
  tags?: TagResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(task: Task, includeRelations: boolean = false): TaskResponseDto {
    const dto: TaskResponseDto = {
      id: task.id,
      title: task.title.value,
      description: task.description?.value,
      status: task.status,
      visibility: task.visibility,
      assignerId: task.assignerId,
      assigneeId: task.assigneeId,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };

    return dto;
  }

  static fromDomainWithRelations(
    task: Task,
    comments?: CommentResponseDto[],
    activityLogs?: ActivityLogResponseDto[],
    subTasks?: SubTaskResponseDto[],
    tags?: TagResponseDto[],
  ): TaskResponseDto {
    const dto = TaskResponseDto.fromDomain(task);
    dto.comments = comments;
    dto.activityLogs = activityLogs;
    dto.subTasks = subTasks;
    dto.tags = tags;
    return dto;
  }
}
