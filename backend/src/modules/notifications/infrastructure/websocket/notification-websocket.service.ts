// src/modules/notifications/infrastructure/websocket/notification-websocket.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Notification } from '../../domain/entities';
import { NotificationResponseDto } from '../../application/dto';

/**
 * Service for managing WebSocket connections and real-time notification delivery
 * Infrastructure layer - handles Socket.IO specific logic
 */
@Injectable()
export class NotificationWebSocketService {
  private readonly logger = new Logger(NotificationWebSocketService.name);

  // Map of userId -> Set of socket IDs (supports multiple devices per user)
  private readonly userConnections = new Map<string, Set<string>>();

  // Map of socketId -> Socket instance
  private readonly sockets = new Map<string, Socket>();

  /**
   * Register a new client connection
   */
  registerClient(userId: string, socket: Socket): void {
    const socketId = socket.id;

    // Add socket to registry
    this.sockets.set(socketId, socket);

    // Add socket to user's connection set
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(socketId);

    this.logger.log(
      `User ${userId} connected with socket ${socketId}. Total connections for user: ${this.userConnections.get(userId)!.size}`
    );

    // Join user-specific room for targeted broadcasting
    socket.join(`user:${userId}`);
  }

  /**
   * Unregister a client connection
   */
  unregisterClient(socket: Socket, userId?: string): void {
    const socketId = socket.id;

    // Remove from sockets map
    this.sockets.delete(socketId);

    // Remove from user connections
    if (userId) {
      const userSockets = this.userConnections.get(userId);
      if (userSockets) {
        userSockets.delete(socketId);

        if (userSockets.size === 0) {
          this.userConnections.delete(userId);
          this.logger.log(`User ${userId} has no more active connections`);
        } else {
          this.logger.log(
            `User ${userId} disconnected socket ${socketId}. Remaining connections: ${userSockets.size}`
          );
        }
      }
    }

    // Leave user room
    if (userId) {
      socket.leave(`user:${userId}`);
    }
  }

  /**
   * Check if a user has any active connections
   */
  isUserOnline(userId: string): boolean {
    const connections = this.userConnections.get(userId);
    return connections !== undefined && connections.size > 0;
  }

  /**
   * Get the number of active connections for a user
   */
  getUserConnectionCount(userId: string): number {
    return this.userConnections.get(userId)?.size || 0;
  }

  /**
   * Send a notification to a specific user's all connected devices
   */
  sendNotificationToUser(userId: string, notification: Notification): void {
    const userSockets = this.userConnections.get(userId);

    if (!userSockets || userSockets.size === 0) {
      this.logger.debug(`User ${userId} is not connected, skipping real-time delivery`);
      return;
    }

    const dto = NotificationResponseDto.fromDomain(notification);

    // Send to all user's sockets
    userSockets.forEach(socketId => {
      const socket = this.sockets.get(socketId);
      if (socket) {
        socket.emit('notification:new', dto);
        this.logger.debug(
          `Sent notification ${notification.id} to user ${userId} on socket ${socketId}`
        );
      }
    });

    this.logger.log(
      `Sent notification ${notification.id} to user ${userId} (${userSockets.size} devices)`
    );
  }

  /**
   * Emit an event to a specific user
   */
  emitToUser(userId: string, event: string, data: any): void {
    const userSockets = this.userConnections.get(userId);

    if (!userSockets || userSockets.size === 0) {
      this.logger.debug(`User ${userId} is not connected, cannot emit event ${event}`);
      return;
    }

    userSockets.forEach(socketId => {
      const socket = this.sockets.get(socketId);
      if (socket) {
        socket.emit(event, data);
      }
    });

    this.logger.debug(`Emitted event ${event} to user ${userId} (${userSockets.size} devices)`);
  }

  /**
   * Get all online user IDs
   */
  getOnlineUserIds(): string[] {
    return Array.from(this.userConnections.keys());
  }

  /**
   * Get total number of connected sockets
   */
  getTotalConnections(): number {
    return this.sockets.size;
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    totalUsers: number;
    totalConnections: number;
    averageConnectionsPerUser: number;
  } {
    const totalUsers = this.userConnections.size;
    const totalConnections = this.sockets.size;
    const averageConnectionsPerUser = totalUsers > 0 ? totalConnections / totalUsers : 0;

    return {
      totalUsers,
      totalConnections,
      averageConnectionsPerUser: Math.round(averageConnectionsPerUser * 100) / 100,
    };
  }
}
