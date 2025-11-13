// src/modules/notifications/infrastructure/websocket/ws-auth.adapter.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ServerOptions } from 'socket.io';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';

/**
 * Custom WebSocket Adapter with JWT Authentication
 * Authenticates clients during the initial handshake
 */
export class WsAuthAdapter extends IoAdapter {
  private readonly logger = new Logger(WsAuthAdapter.name);
  private jwtService: JwtService;

  constructor(app: INestApplicationContext) {
    super(app);
    this.jwtService = app.get(JwtService);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options) as Server;

    // Add authentication middleware to the /notifications namespace
    const notificationsNamespace = server.of('/notifications');

    notificationsNamespace.use(async (socket: Socket, next) => {
      try {
        const token = this.extractToken(socket);

        if (!token) {
          this.logger.warn(`Connection rejected: No token provided`);
          return next(new Error('Authentication token is required'));
        }

        // Verify JWT token
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        });

        // Attach user data to socket
        socket.data.user = {
          userId: payload.sub,
          email: payload.email,
          roles: payload.roles || [],
        };

        this.logger.debug(`Socket ${socket.id} authenticated for user ${payload.sub}`);
        next();
      } catch (error) {
        this.logger.warn(`Socket authentication failed: ${error.message}`);
        next(new Error('Invalid or expired authentication token'));
      }
    });

    return server;
  }

  /**
   * Extract JWT token from socket handshake
   */
  private extractToken(socket: Socket): string | null {
    // Try Authorization header (Bearer token)
    const authHeader = socket.handshake.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try auth object or query parameter
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (typeof token === 'string') {
      return token;
    }

    return null;
  }
}
