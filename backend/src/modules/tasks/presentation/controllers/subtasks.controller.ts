import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';
import { TenantAccessGuard } from 'src/shared/guards/tenant-access.guard';
import { TenantContextCompleteGuard } from 'src/shared/guards/tenant-context-complete.guard';
import { CurrentUser } from '../../../../shared/infrastructure/decorators/current-user.decorator';
import { UpdateSubTaskStatusDto } from '../../application/dto/update-subtask-status.dto';
import { SubTaskResponseDto } from '../../application/dto/subtask-response.dto';
import { UpdateSubTaskStatusCommand } from '../../application/commands/update-subtask-status/update-subtask-status.command';

@Controller('subtasks')
@UseGuards(JwtAuthGuard, TenantContextCompleteGuard, TenantAccessGuard)
export class SubTasksController {
  constructor(private readonly commandBus: CommandBus) {}

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateSubTaskStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSubTaskStatusDto,
    @CurrentUser() currentUser: any,
  ): Promise<SubTaskResponseDto> {
    const command = new UpdateSubTaskStatusCommand(
      id,
      currentUser.userId,
      dto.status,
    );
    const subTask = await this.commandBus.execute(command);
    return SubTaskResponseDto.fromDomain(subTask);
  }
}
