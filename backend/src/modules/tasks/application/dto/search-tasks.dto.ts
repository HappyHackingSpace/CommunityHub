import { IsOptional, IsString, IsEnum, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { PaginationDto } from './pagination.dto';

export class SearchTasksDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Type(() => String)
  tagIds?: string[];
}
