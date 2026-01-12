// src/modules/notifications/infrastructure/websocket/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, Inject } from '@nestjs/common';
import { validate as uuidValidate, v4 as uuidv4 } from 'uuid';
import { ClsService } from 'nestjs-cls';
import { WsJwtAuthGuard } from './ws-jwt-auth.guard';
import { NotificationWebSocketService } from './notification-websocket.service';
import { NotificationService } from '../../application/services/notification.service';
import type { INotificationRepository } from '../../domain/repositories';
import { Notification } from '../../domain/entities';
import {
  NotificationChannel,
  NotificationPriority,
  NotificationType,
} from '../../domain/enums';
import { TENANT_CONTEXT_KEY, type TenantContext } from 'src/shared/context/tenant-context';

/**
 * WebSocket Gateway for real-time notifications
 * Handles client connections, authentication, and real-time event delivery
 */
@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : true, // Allow all origins in development (including file://)
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly wsService: NotificationWebSocketService,
    private readonly notificationService: NotificationService,
    private readonly clsService: ClsService,
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  private async runWithClsContext<T>(
    client: Socket,
    handler: () => Promise<T>,
  ): Promise<T> {
    const tenantContext = client.data.tenantContext as TenantContext;
    if (!tenantContext) {
      throw new Error('Tenant context not available on socket');
    }

    return this.clsService.run(async () => {
      this.clsService.set(TENANT_CONTEXT_KEY, tenantContext);
      return handler();
    });
  }

  /**
   * Handle new client connections
   * Authenticates the client and registers them for notifications
   */
  async handleConnection(client: Socket) {
    try {
      // Extract and verify JWT token
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Connection rejected: No token provided`);
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      // Token verification is handled by the guard in message handlers
      // For connection, we do basic validation
      const user = client.data.user;
      if (!user) {
        // Try to authenticate manually for connection
        this.logger.warn(`Connection attempt without authenticated user data`);
        client.emit('error', { message: 'Authentication failed' });
        client.disconnect();
        return;
      }

      const userId = user.userId;

      await this.runWithClsContext(client, async () => {
        // Register client (tenant context is set by WsAuthAdapter during handshake)
        this.wsService.registerClient(userId, client);

        // Send connection success event with stats
        client.emit('connection:success', {
          message: 'Connected to notification service',
          userId,
          timestamp: new Date().toISOString(),
        });

        // Send unread notification count
        const unreadNotifications = await this.notificationService.getUnreadNotifications(userId);
        client.emit('notifications:unread-count', {
          count: unreadNotifications.length,
        });
      });

      this.logger.log(`Client ${client.id} connected for user ${userId}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`, error.stack);
      client.emit('error', { message: 'Connection failed' });
      client.disconnect();
    }
  }

  /**
   * Handle client disconnections
   */
  handleDisconnect(client: Socket) {
    const userId = client.data.user?.userId;
    this.wsService.unregisterClient(client, userId);
    this.logger.log(`Client ${client.id} disconnected${userId ? ` (user: ${userId})` : ''}`);
  }

  /**
   * Handle request for recent notifications
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('notifications:fetch')
  async handleFetchNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { limit?: number },
  ) {
    try {
      return await this.runWithClsContext(client, async () => {
        const userId = client.data.user.userId;
        const limit = data?.limit || 20;

        const notifications = await this.notificationService.getUserNotifications(
          userId,
          limit,
        );

        return {
          event: 'notifications:list',
          data: notifications,
        };
      });
    } catch (error) {
      this.logger.error(`Error fetching notifications: ${error.message}`, error.stack);
      return {
        event: 'error',
        data: { message: 'Failed to fetch notifications' },
      };
    }
  }

  /**
   * Handle request for unread notifications
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('notifications:fetch-unread')
  async handleFetchUnreadNotifications(@ConnectedSocket() client: Socket) {
    try {
      return await this.runWithClsContext(client, async () => {
        const userId = client.data.user.userId;

        const notifications = await this.notificationService.getUnreadNotifications(userId);

        return {
          event: 'notifications:unread',
          data: notifications,
        };
      });
    } catch (error) {
      this.logger.error(`Error fetching unread notifications: ${error.message}`, error.stack);
      return {
        event: 'error',
        data: { message: 'Failed to fetch unread notifications' },
      };
    }
  }

  /**
   * Mark a notification as read
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('notifications:mark-read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    try {
      return await this.runWithClsContext(client, async () => {
        const userId = client.data.user.userId;
        const { notificationId } = data;

        if (!notificationId || !uuidValidate(notificationId)) {
          return {
            event: 'error',
            data: { message: 'Invalid notificationId' },
          };
        }

        const notification = await this.notificationRepository.findById(notificationId);
        if (!notification || notification.userId !== userId) {
          return {
            event: 'error',
            data: { message: 'Notification not found or access denied' },
          };
        }

        await this.notificationService.markAsRead(notificationId);

        const unreadNotifications = await this.notificationService.getUnreadNotifications(userId);
        this.wsService.emitToUser(userId, 'notifications:unread-count', {
          count: unreadNotifications.length,
        });

        return {
          event: 'notifications:marked-read',
          data: { notificationId, success: true },
        };
      });
    } catch (error) {
      this.logger.error(`Error marking notification as read: ${error.message}`, error.stack);
      return {
        event: 'error',
        data: { message: 'Failed to mark notification as read' },
      };
    }
  }

  /**
   * Mark all notifications as read
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('notifications:mark-all-read')
  async handleMarkAllAsRead(@ConnectedSocket() client: Socket) {
    try {
      return await this.runWithClsContext(client, async () => {
        const userId = client.data.user.userId;

        await this.notificationService.markAllAsRead(userId);

        this.wsService.emitToUser(userId, 'notifications:unread-count', {
          count: 0,
        });

        return {
          event: 'notifications:all-marked-read',
          data: { success: true },
        };
      });
    } catch (error) {
      this.logger.error(`Error marking all as read: ${error.message}`, error.stack);
      return {
        event: 'error',
        data: { message: 'Failed to mark all as read' },
      };
    }
  }

  /**
   * Archive a notification
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('notifications:archive')
  async handleArchive(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    try {
      return await this.runWithClsContext(client, async () => {
        const userId = client.data.user.userId;
        const { notificationId } = data;

        if (!notificationId) {
          return {
            event: 'error',
            data: { message: 'Missing notificationId' },
          };
        }

        const notification = await this.notificationRepository.findById(notificationId);
        if (!notification || notification.userId !== userId) {
          return {
            event: 'error',
            data: { message: 'Notification not found or access denied' },
          };
        }

        await this.notificationService.archiveNotification(notificationId);

        return {
          event: 'notifications:archived',
          data: { notificationId, success: true },
        };
      });
    } catch (error) {
      this.logger.error(`Error archiving notification: ${error.message}`, error.stack);
      return {
        event: 'error',
        data: { message: 'Failed to archive notification' },
      };
    }
  }

  /**
   * Get connection statistics (admin only - could add role check)
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('notifications:stats')
  async handleGetStats(@ConnectedSocket() client: Socket) {
    try {
      const stats = this.wsService.getConnectionStats();

      return {
        event: 'notifications:stats',
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Error getting stats: ${error.message}`, error.stack);
      return {
        event: 'error',
        data: { message: 'Failed to get statistics' },
      };
    }
  }

  /**
   * Send test notification (for testing purposes)
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('notifications:send-test')
  async handleSendTest(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      tenantId: number;
      userId: string;
      title?: string;
      message?: string;
      isHtml?: boolean;
      metadata?: Record<string, any>;
    },
  ) {
    try {
      return await this.runWithClsContext(client, async () => {
        const userId = client.data.user.userId;
        const tenantId = client.data.tenantContext?.tenantId ?? data.tenantId;

        const title = (data.title || 'Test Notification').toString();
        const message =
          (data.message ||
            'This is a test notification from WebSocket handler')?.toString();

        const mergedMetadata = {
          ...(data.metadata || {}),
          isTest: true,
          isHtml: data.isHtml ?? data.metadata?.isHtml,
          renderAsHtml: data.isHtml ?? data.metadata?.renderAsHtml,
        };

        const notification = new Notification(
          uuidv4(),
          userId,
          NotificationType.ACCOUNT_UPDATED,
          NotificationChannel.PUSH,
          title,
          message,
          NotificationPriority.MEDIUM,
          mergedMetadata,
        );

        notification.markAsSent();

        const savedNotification = await this.notificationRepository.save(notification);

        this.wsService.sendNotificationToUser(userId, savedNotification);

        const unreadNotifications = await this.notificationService.getUnreadNotifications(userId);
        this.wsService.emitToUser(userId, 'notifications:unread-count', {
          count: unreadNotifications.length,
        });

        this.logger.log(
          `Test notification sent to user ${userId} in tenant ${tenantId} (id: ${savedNotification.id})`,
        );

        return {
          event: 'notifications:test-sent',
          data: {
            success: true,
            message: 'Test notification sent',
            id: savedNotification.id,
          },
        };
      });
    } catch (error) {
      this.logger.error(`Error sending test notification: ${error.message}`, error.stack);
      return {
        event: 'error',
        data: { message: 'Failed to send test notification' },
      };
    }
  }

  /**
   * Extract token from socket handshake
   */
  private extractToken(client: Socket): string | null {
    // Try Authorization header
    const authHeader = client.handshake.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try query parameter or auth object
    const token = client.handshake.auth?.token || client.handshake.query?.token;
    if (typeof token === 'string') {
      return token;
    }

    return null;
  }
}
