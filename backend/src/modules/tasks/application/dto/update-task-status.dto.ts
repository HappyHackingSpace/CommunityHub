import { IsEnum } from 'class-validator';
import { TaskStatus } from '../../domain/enums/task-status.enum';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
