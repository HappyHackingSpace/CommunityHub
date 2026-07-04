import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';
import { FlexibleAuthGuard } from '../../../iam/infrastructure/guards/flexible-auth.guard';
import { ScopesGuard } from '../../../iam/infrastructure/guards/scopes.guard';
import { ApiKeyThrottlerGuard } from '../../../iam/infrastructure/guards/api-key-throttler.guard';
import { TenantAccessGuard } from '../../../../shared/guards/tenant-access.guard';
import { TenantContextCompleteGuard } from '../../../../shared/guards/tenant-context-complete.guard';
import { RequireScopes } from '../../../iam/infrastructure/decorators/require-scopes.decorator';
import { Roles } from '../../../iam/infrastructure/decorators/roles.decorator';
import { RoleType } from '../../../iam/domain/enums/role-type.enum';
import { RolesGuard } from '../../../iam/infrastructure/guards/roles.guard';
import { CurrentUser } from '../../../../shared/infrastructure/decorators/current-user.decorator';
import { CreateTaskDto } from '../../application/dto/create-task.dto';
import { UpdateTaskDto } from '../../application/dto/update-task.dto';
import { UpdateTaskStatusDto } from '../../application/dto/update-task-status.dto';
import { CreateCommentDto } from '../../application/dto/create-comment.dto';
import { CreateSubTaskDto } from '../../application/dto/create-subtask.dto';
import { AttachTagsDto } from '../../application/dto/attach-tags.dto';
import { SearchTasksDto } from '../../application/dto/search-tasks.dto';
import { TaskResponseDto } from '../../application/dto/task-response.dto';
import { CommentResponseDto } from '../../application/dto/comment-response.dto';
import { SubTaskResponseDto } from '../../application/dto/subtask-response.dto';
import { CreateAttachmentDto } from '../../application/dto/create-attachment.dto';
import { AssignMentorDto } from '../../application/dto/assign-mentor.dto';
import { RequestHelpDto } from '../../application/dto/request-help.dto';
import { RequestTaskHandoverDto } from '../../application/dto/request-task-handover.dto';
import { CreateTaskCommand } from '../../application/commands/create-task/create-task.command';
import { UpdateTaskCommand } from '../../application/commands/update-task/update-task.command';
import { UpdateTaskStatusCommand } from '../../application/commands/update-task-status/update-task-status.command';
import { DeleteTaskCommand } from '../../application/commands/delete-task/delete-task.command';
import { AddCommentCommand } from '../../application/commands/add-comment/add-comment.command';
import { AddSubTaskCommand } from '../../application/commands/add-subtask/add-subtask.command';
import { AttachTagsCommand } from '../../application/commands/attach-tags/attach-tags.command';
import { DetachTagCommand } from '../../application/commands/detach-tag/detach-tag.command';
import { GetTaskQuery } from '../../application/queries/get-task/get-task.query';
import { GetPublicTasksQuery } from '../../application/queries/get-public-tasks/get-public-tasks.query';
import { GetAssignedToMeTasksQuery } from '../../application/queries/get-assigned-to-me-tasks/get-assigned-to-me-tasks.query';
import { GetAssignedByMeTasksQuery } from '../../application/queries/get-assigned-by-me-tasks/get-assigned-by-me-tasks.query';
import { GetActivityLogsQuery } from '../../application/queries/get-activity-logs/get-activity-logs.query';
import { SearchPublicTasksQuery } from '../../application/queries/search-public-tasks/search-public-tasks.query';
import { SearchAssignedToMeTasksQuery } from '../../application/queries/search-assigned-to-me-tasks/search-assigned-to-me-tasks.query';
import { SearchAssignedByMeTasksQuery } from '../../application/queries/search-assigned-by-me-tasks/search-assigned-by-me-tasks.query';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { AddAttachmentCommand } from '../../application/commands/add-attachment/add-attachment.command';
import { AssignMentorCommand } from '../../application/commands/assign-mentor/assign-mentor.command';
import { RequestHelpCommand } from '../../application/commands/request-help/request-help.command';
import { RequestTaskHandoverCommand } from '../../application/commands/request-task-handover/request-task-handover.command';
import { VolunteerForTaskCommand } from '../../application/commands/volunteer-for-task/volunteer-for-task.command';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(FlexibleAuthGuard, RolesGuard, ScopesGuard, TenantContextCompleteGuard, TenantAccessGuard, ApiKeyThrottlerGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TasksController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(RoleType.FOUNDER, RoleType.ADMIN)
  @RequireScopes('tasks:write')
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Body() dto: CreateTaskDto,
    @CurrentUser() currentUser: any,
  ): Promise<TaskResponseDto> {
    const command = new CreateTaskCommand(
      dto.title,
      currentUser.userId,
      dto.description,
      dto.assigneeId,
      dto.dueDate ? new Date(dto.dueDate) : undefined,
      dto.visibility,
      dto.priority,
      dto.estimatedTime,
      dto.points,
      dto.isRecurring,
      dto.recurringSchedule,
      dto.requiredSkills,
      dto.tagIds,
    );
    const task = await this.commandBus.execute(command);
    return TaskResponseDto.fromDomain(task);
  }

  @Get('public')
  @RequireScopes('tasks:read')
  @HttpCode(HttpStatus.OK)
  async getPublicTasks(): Promise<TaskResponseDto[]> {
    const query = new GetPublicTasksQuery();
    return await this.queryBus.execute(query);
  }

  @Get('search/public')
  @HttpCode(HttpStatus.OK)
  async searchPublicTasks(@Query() searchDto: SearchTasksDto) {
    const query = new SearchPublicTasksQuery({
      search: searchDto.search,
      status: searchDto.status,
      tagIds: searchDto.tagIds,
      page: searchDto.page || 1,
      limit: searchDto.limit || 10,
    });
    return await this.queryBus.execute(query);
  }

  @Get('assigned-to-me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAssignedToMeTasks(
    @CurrentUser() currentUser: any,
    @Query('status') status?: TaskStatus,
  ): Promise<TaskResponseDto[]> {
    const query = new GetAssignedToMeTasksQuery(currentUser.userId, status);
    return await this.queryBus.execute(query);
  }

  @Get('search/assigned-to-me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async searchAssignedToMeTasks(
    @CurrentUser() currentUser: any,
    @Query() searchDto: SearchTasksDto,
  ) {
    const query = new SearchAssignedToMeTasksQuery(currentUser.userId, {
      search: searchDto.search,
      status: searchDto.status,
      tagIds: searchDto.tagIds,
      page: searchDto.page || 1,
      limit: searchDto.limit || 10,
    });
    return await this.queryBus.execute(query);
  }

  @Get('assigned-by-me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAssignedByMeTasks(
    @CurrentUser() currentUser: any,
    @Query('status') status?: TaskStatus,
  ): Promise<TaskResponseDto[]> {
    const query = new GetAssignedByMeTasksQuery(currentUser.userId, status);
    return await this.queryBus.execute(query);
  }

  @Get('search/assigned-by-me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async searchAssignedByMeTasks(
    @CurrentUser() currentUser: any,
    @Query() searchDto: SearchTasksDto,
  ) {
    const query = new SearchAssignedByMeTasksQuery(currentUser.userId, {
      search: searchDto.search,
      status: searchDto.status,
      tagIds: searchDto.tagIds,
      page: searchDto.page || 1,
      limit: searchDto.limit || 10,
    });
    return await this.queryBus.execute(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getTask(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<TaskResponseDto> {
    const query = new GetTaskQuery(id, currentUser.userId);
    return await this.queryBus.execute(query);
  }

  @Patch(':id')
  @Roles(RoleType.FOUNDER, RoleType.ADMIN, RoleType.ORGANIZER)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateTask(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() currentUser: any,
  ): Promise<TaskResponseDto> {
    const command = new UpdateTaskCommand(
      id,
      currentUser.userId,
      dto.title,
      dto.description,
      dto.dueDate ? new Date(dto.dueDate) : undefined,
      dto.visibility,
    );
    const task = await this.commandBus.execute(command);
    return TaskResponseDto.fromDomain(task);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateTaskStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
    @CurrentUser() currentUser: any,
  ): Promise<TaskResponseDto> {
    const command = new UpdateTaskStatusCommand(
      id,
      currentUser.userId,
      dto.status,
    );
    const task = await this.commandBus.execute(command);
    return TaskResponseDto.fromDomain(task);
  }

  @Delete(':id')
  @Roles(RoleType.FOUNDER, RoleType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    const command = new DeleteTaskCommand(id, currentUser.userId);
    await this.commandBus.execute(command);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() currentUser: any,
  ): Promise<CommentResponseDto> {
    const command = new AddCommentCommand(
      id,
      currentUser.userId,
      dto.content,
    );
    const comment = await this.commandBus.execute(command);
    return CommentResponseDto.fromDomain(comment);
  }

  @Get(':id/activity')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getActivityLogs(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ) {
    const query = new GetActivityLogsQuery(id, currentUser.userId);
    return await this.queryBus.execute(query);
  }

  @Post(':id/subtasks')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addSubTask(
    @Param('id') id: string,
    @Body() dto: CreateSubTaskDto,
    @CurrentUser() currentUser: any,
  ): Promise<SubTaskResponseDto> {
    const command = new AddSubTaskCommand(id, currentUser.userId, dto.title);
    const subTask = await this.commandBus.execute(command);
    return SubTaskResponseDto.fromDomain(subTask);
  }

  @Post(':id/tags')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async attachTags(
    @Param('id') id: string,
    @Body() dto: AttachTagsDto,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    const command = new AttachTagsCommand(id, currentUser.userId, dto.tagIds);
    await this.commandBus.execute(command);
  }

  @Delete(':id/tags/:tagId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async detachTag(
    @Param('id') id: string,
    @Param('tagId') tagId: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    const command = new DetachTagCommand(id, currentUser.userId, tagId);
    await this.commandBus.execute(command);
  }

  // ========== NEW ENDPOINTS ==========

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Add attachment to task' })
  @ApiResponse({ status: 201, description: 'Attachment added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid attachment data' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addAttachment(
    @Param('id') id: string,
    @Body() dto: CreateAttachmentDto,
    @CurrentUser() currentUser: any,
  ): Promise<any> {
    const command = new AddAttachmentCommand(
      id,
      currentUser.userId,
      dto.fileName,
      dto.fileUrl,
      dto.fileSize,
      dto.mimeType,
    );
    return await this.commandBus.execute(command);
  }

  @Post(':id/mentor')
  @ApiOperation({ summary: 'Assign mentor to task' })
  @ApiResponse({ status: 200, description: 'Mentor assigned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid mentor ID' })
  @ApiResponse({ status: 404, description: 'Task or mentor not found' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async assignMentor(
    @Param('id') id: string,
    @Body() dto: AssignMentorDto,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    const command = new AssignMentorCommand(id, dto.mentorId, currentUser.userId);
    await this.commandBus.execute(command);
  }

  @Post(':id/help')
  @ApiOperation({ summary: 'Request help on task' })
  @ApiResponse({ status: 200, description: 'Help request submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid help request data' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async requestHelp(
    @Param('id') id: string,
    @Body() dto: RequestHelpDto,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    const command = new RequestHelpCommand(id, currentUser.userId, dto.message);
    await this.commandBus.execute(command);
  }

  @Post(':id/handover')
  @ApiOperation({ summary: 'Request task handover' })
  @ApiResponse({ status: 200, description: 'Handover request submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid handover request data' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async requestHandover(
    @Param('id') id: string,
    @Body() dto: RequestTaskHandoverDto,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    const command = new RequestTaskHandoverCommand(id, currentUser.userId, dto.reason);
    await this.commandBus.execute(command);
  }

  @Post(':id/volunteer')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async volunteerForTask(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    const command = new VolunteerForTaskCommand(id, currentUser.userId);
    await this.commandBus.execute(command);
  }
}
