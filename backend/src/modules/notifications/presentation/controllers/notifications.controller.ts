// src/modules/notifications/presentation/controllers/notifications.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/infrastructure/decorators/current-user.decorator';
import { NotificationService } from '../../application/services/notification.service';
import { NotificationResponseDto } from '../../application/dto';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  async getUserNotifications(
    @CurrentUser('userId') userId: string,
    @Query('limit') limit?: number,
  ): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationService.getUserNotifications(
      userId,
      limit,
    );

    return notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type,
      channel: n.channel,
      status: n.status,
      priority: n.priority,
      title: n.title,
      message: n.message,
      metadata: n.metadata,
      actionButtons: n.actionButtons,
      readAt: n.readAt,
      sentAt: n.sentAt,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }));
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  async getUnreadNotifications(
    @CurrentUser('userId') userId: string,
  ): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationService.getUnreadNotifications(
      userId,
    );

    return notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type,
      channel: n.channel,
      status: n.status,
      priority: n.priority,
      title: n.title,
      message: n.message,
      metadata: n.metadata,
      actionButtons: n.actionButtons,
      readAt: n.readAt,
      sentAt: n.sentAt,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }));
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.notificationService.markAsRead(id);
    return { success: true };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(
    @CurrentUser('userId') userId: string,
  ): Promise<{ success: boolean }> {
    await this.notificationService.markAllAsRead(userId);
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive notification' })
  async archiveNotification(
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    await this.notificationService.archiveNotification(id);
    return { success: true };
  }
}
