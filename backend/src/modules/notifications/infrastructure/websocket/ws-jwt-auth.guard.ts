// src/modules/notifications/infrastructure/websocket/ws-jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

/**
 * WebSocket JWT Authentication Guard
 * Validates JWT token from socket handshake and attaches user to socket data
 */
@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtAuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        throw new WsException('Missing authentication token');
      }

      // Verify and decode JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Attach user info to socket data
      client.data.user = {
        userId: payload.sub,
        email: payload.email,
        roles: payload.roles || [],
      };

      this.logger.debug(`WebSocket authenticated for user ${payload.sub}`);

      return true;
    } catch (error) {
      this.logger.warn(`WebSocket authentication failed: ${error.message}`);
      throw new WsException('Invalid or expired token');
    }
  }

  /**
   * Extract JWT token from socket handshake
   * Supports both Authorization header and query parameter
   */
  private extractTokenFromHandshake(client: Socket): string | null {
    // Try Authorization header first (Bearer token)
    const authHeader = client.handshake.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Fallback to query parameter for clients that can't set headers
    const token = client.handshake.auth?.token || client.handshake.query?.token;
    if (typeof token === 'string') {
      return token;
    }

    return null;
  }
}
