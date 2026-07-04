import { IsEnum } from 'class-validator';
import { TaskStatus } from '../../domain/enums/task-status.enum';

export class UpdateSubTaskStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
