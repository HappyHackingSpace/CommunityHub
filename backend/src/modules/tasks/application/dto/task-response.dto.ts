import { Task } from '../../domain/entities/task.entity';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { TaskVisibility } from '../../domain/enums/task-visibility.enum';
import { TaskPriority } from '../../domain/enums/task-priority.enum';
import { CommentResponseDto } from './comment-response.dto';
import { ActivityLogResponseDto } from './activity-log-response.dto';
import { SubTaskResponseDto } from './subtask-response.dto';
import { TagResponseDto } from './tag-response.dto';
import { AttachmentResponseDto } from './attachment-response.dto';

export class TaskResponseDto {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  visibility: TaskVisibility;
  assignerId: string;
  assigneeId?: string;
  dueDate?: Date;
  priority: TaskPriority;
  estimatedTime?: number;
  points?: number;
  isRecurring: boolean;
  recurringSchedule?: string;
  requiredSkills?: string[];
  mentorId?: string;
  comments?: CommentResponseDto[];
  activityLogs?: ActivityLogResponseDto[];
  subTasks?: SubTaskResponseDto[];
  tags?: TagResponseDto[];
  attachments?: AttachmentResponseDto[];
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
      priority: task.priority.getValue(),
      estimatedTime: task.estimatedTime,
      points: task.points,
      isRecurring: task.isRecurring,
      recurringSchedule: task.recurringSchedule,
      requiredSkills: task.requiredSkills,
      mentorId: task.mentorId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      tags: task.tags?.map(t => TagResponseDto.fromDomain(t)) || [],
    };

    return dto;
  }

  static fromDomainWithRelations(
    task: Task,
    comments?: CommentResponseDto[],
    activityLogs?: ActivityLogResponseDto[],
    subTasks?: SubTaskResponseDto[],
    tags?: TagResponseDto[],
    attachments?: AttachmentResponseDto[],
  ): TaskResponseDto {
    const dto = TaskResponseDto.fromDomain(task);
    dto.comments = comments;
    dto.activityLogs = activityLogs;
    dto.subTasks = subTasks;
    dto.tags = tags;
    dto.attachments = attachments;
    return dto;
  }
}
