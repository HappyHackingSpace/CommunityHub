// src/modules/notifications/infrastructure/websocket/ws-auth.adapter.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClsService } from 'nestjs-cls';
import { ServerOptions } from 'socket.io';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { TENANT_CONTEXT_KEY, type TenantContext } from 'src/shared/context/tenant-context';

/**
 * Custom WebSocket Adapter with JWT Authentication
 * Authenticates clients during the initial handshake
 */
export class WsAuthAdapter extends IoAdapter {
  private readonly logger = new Logger(WsAuthAdapter.name);
  private jwtService: JwtService;
  private cls: ClsService;

  constructor(app: INestApplicationContext) {
    super(app);
    this.jwtService = app.get(JwtService);
    this.cls = app.get(ClsService);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options) as Server;

    const notificationsNamespace = server.of('/notifications');

    notificationsNamespace.use(async (socket: Socket, next) => {
      try {
        const token = this.extractToken(socket);

        if (!token) {
          this.logger.warn(`Connection rejected: No token provided`);
          return next(new Error('Authentication token is required'));
        }

        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        });

        socket.data.user = {
          userId: payload.sub,
          email: payload.email,
          roles: payload.roles || [],
          tenantId: payload.tenantId,
        };

        const tenantContext: TenantContext = {
          tenantId: payload.tenantId || 0,
          userId: payload.sub,
          globalRole: payload.roles?.[0] || 'USER',
        };

        socket.data.tenantContext = tenantContext;

        if (payload.tenantId) {
          this.logger.log(
            `Socket ${socket.id} authenticated - User: ${payload.sub}, Tenant: ${payload.tenantId}`,
          );
        } else {
          this.logger.warn(
            `Socket ${socket.id} authenticated without tenantId - User: ${payload.sub}`,
          );
        }

        next();
      } catch (error) {
        this.logger.error(`Socket authentication failed: ${error.message}`);
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
