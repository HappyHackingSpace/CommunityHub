import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

// ORM Entities
import { TaskOrmEntity } from './infrastructure/persistence/typeorm/entities/task.orm-entity';
import { CommentOrmEntity } from './infrastructure/persistence/typeorm/entities/comment.orm-entity';
import { ActivityLogOrmEntity } from './infrastructure/persistence/typeorm/entities/activity-log.orm-entity';
import { SubTaskOrmEntity } from './infrastructure/persistence/typeorm/entities/subtask.orm-entity';
import { TagOrmEntity } from './infrastructure/persistence/typeorm/entities/tag.orm-entity';
import { AssignmentHistoryOrmEntity } from './infrastructure/persistence/typeorm/entities/assignment-history.orm-entity';

// Repositories
import { TaskRepository } from './infrastructure/persistence/typeorm/repositories/task.repository';
import { CommentRepository } from './infrastructure/persistence/typeorm/repositories/comment.repository';
import { ActivityLogRepository } from './infrastructure/persistence/typeorm/repositories/activity-log.repository';
import { SubTaskRepository } from './infrastructure/persistence/typeorm/repositories/subtask.repository';
import { TagRepository } from './infrastructure/persistence/typeorm/repositories/tag.repository';
import { TaskTagRepository } from './infrastructure/persistence/typeorm/repositories/task-tag.repository';
import { AssignmentHistoryRepository } from './infrastructure/persistence/typeorm/repositories/assignment-history.repository';

// Command Handlers
import { CreateTaskHandler } from './application/commands/create-task/create-task.handler';
import { UpdateTaskHandler } from './application/commands/update-task/update-task.handler';
import { UpdateTaskStatusHandler } from './application/commands/update-task-status/update-task-status.handler';
import { DeleteTaskHandler } from './application/commands/delete-task/delete-task.handler';
import { AddCommentHandler } from './application/commands/add-comment/add-comment.handler';
import { AddSubTaskHandler } from './application/commands/add-subtask/add-subtask.handler';
import { UpdateSubTaskStatusHandler } from './application/commands/update-subtask-status/update-subtask-status.handler';
import { AttachTagsHandler } from './application/commands/attach-tags/attach-tags.handler';
import { DetachTagHandler } from './application/commands/detach-tag/detach-tag.handler';
import { CreateTagHandler } from './application/commands/create-tag/create-tag.handler';
import { AssignTaskHandler } from './application/commands/assign-task/assign-task.handler';

// Query Handlers
import { GetTaskHandler } from './application/queries/get-task/get-task.handler';
import { GetPublicTasksHandler } from './application/queries/get-public-tasks/get-public-tasks.handler';
import { GetAssignedToMeTasksHandler } from './application/queries/get-assigned-to-me-tasks/get-assigned-to-me-tasks.handler';
import { GetAssignedByMeTasksHandler } from './application/queries/get-assigned-by-me-tasks/get-assigned-by-me-tasks.handler';
import { GetActivityLogsHandler } from './application/queries/get-activity-logs/get-activity-logs.handler';
import { GetAllTagsHandler } from './application/queries/get-all-tags/get-all-tags.handler';
import { SearchPublicTasksHandler } from './application/queries/search-public-tasks/search-public-tasks.handler';
import { SearchAssignedToMeTasksHandler } from './application/queries/search-assigned-to-me-tasks/search-assigned-to-me-tasks.handler';
import { SearchAssignedByMeTasksHandler } from './application/queries/search-assigned-by-me-tasks/search-assigned-by-me-tasks.handler';
import { GetAssignmentHistoryHandler } from './application/queries/get-assignment-history/get-assignment-history.handler';

// Controllers
import { TasksController } from './presentation/controllers/tasks.controller';
import { SubTasksController } from './presentation/controllers/subtasks.controller';
import { TagsController } from './presentation/controllers/tags.controller';

const CommandHandlers = [
  CreateTaskHandler,
  UpdateTaskHandler,
  UpdateTaskStatusHandler,
  DeleteTaskHandler,
  AddCommentHandler,
  AddSubTaskHandler,
  UpdateSubTaskStatusHandler,
  AttachTagsHandler,
  DetachTagHandler,
  CreateTagHandler,
  AssignTaskHandler,
];

const QueryHandlers = [
  GetTaskHandler,
  GetPublicTasksHandler,
  GetAssignedToMeTasksHandler,
  GetAssignedByMeTasksHandler,
  GetActivityLogsHandler,
  GetAllTagsHandler,
  SearchPublicTasksHandler,
  SearchAssignedToMeTasksHandler,
  SearchAssignedByMeTasksHandler,
  GetAssignmentHistoryHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaskOrmEntity,
      CommentOrmEntity,
      ActivityLogOrmEntity,
      SubTaskOrmEntity,
      TagOrmEntity,
      AssignmentHistoryOrmEntity,
    ]),
    CqrsModule,
  ],
  controllers: [TasksController, SubTasksController, TagsController],
  providers: [
    {
      provide: 'ITaskRepository',
      useClass: TaskRepository,
    },
    {
      provide: 'ICommentRepository',
      useClass: CommentRepository,
    },
    {
      provide: 'IActivityLogRepository',
      useClass: ActivityLogRepository,
    },
    {
      provide: 'ISubTaskRepository',
      useClass: SubTaskRepository,
    },
    {
      provide: 'ITagRepository',
      useClass: TagRepository,
    },
    {
      provide: 'ITaskTagRepository',
      useClass: TaskTagRepository,
    },
    {
      provide: 'IAssignmentHistoryRepository',
      useClass: AssignmentHistoryRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    'ITaskRepository',
    'ICommentRepository',
    'IActivityLogRepository',
    'ISubTaskRepository',
    'ITagRepository',
    'ITaskTagRepository',
    'IAssignmentHistoryRepository',
  ],
})
export class TasksModule {}
