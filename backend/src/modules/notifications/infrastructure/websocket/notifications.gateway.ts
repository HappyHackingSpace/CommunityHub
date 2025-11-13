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
import { WsJwtAuthGuard } from './ws-jwt-auth.guard';
import { NotificationWebSocketService } from './notification-websocket.service';
import { NotificationService } from '../../application/services/notification.service';
import type { INotificationRepository } from '../../domain/repositories';

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
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

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

      // Register client
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
      const userId = client.data.user.userId;

      const notifications = await this.notificationService.getUnreadNotifications(userId);

      return {
        event: 'notifications:unread',
        data: notifications,
      };
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
      const userId = client.data.user.userId;
      const { notificationId } = data;

      if (!notificationId) {
        return {
          event: 'error',
          data: { message: 'Missing notificationId' },
        };
      }

      // Verify notification belongs to user
      const notification = await this.notificationRepository.findById(notificationId);
      if (!notification || notification.userId !== userId) {
        return {
          event: 'error',
          data: { message: 'Notification not found or access denied' },
        };
      }

      await this.notificationService.markAsRead(notificationId);

      // Send updated unread count to all user's devices
      const unreadNotifications = await this.notificationService.getUnreadNotifications(userId);
      this.wsService.emitToUser(userId, 'notifications:unread-count', {
        count: unreadNotifications.length,
      });

      return {
        event: 'notifications:marked-read',
        data: { notificationId, success: true },
      };
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
      const userId = client.data.user.userId;

      await this.notificationService.markAllAsRead(userId);

      // Notify all user's devices
      this.wsService.emitToUser(userId, 'notifications:unread-count', {
        count: 0,
      });

      return {
        event: 'notifications:all-marked-read',
        data: { success: true },
      };
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
      const userId = client.data.user.userId;
      const { notificationId } = data;

      if (!notificationId) {
        return {
          event: 'error',
          data: { message: 'Missing notificationId' },
        };
      }

      // Verify notification belongs to user
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
