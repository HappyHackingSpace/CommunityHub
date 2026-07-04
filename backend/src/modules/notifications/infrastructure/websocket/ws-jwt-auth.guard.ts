import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

/**
 * WebSocket JWT Authentication Guard
 * Ensures authenticated user data is present on socket
 * CLS context is already set by WsAuthAdapter during handshake
 */
@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();

      if (!client.data.user) {
        throw new WsException('User not authenticated');
      }

      if (!client.data.tenantContext) {
        throw new WsException('Tenant context not found');
      }

      this.logger.debug(
        `WebSocket handler - User: ${client.data.user.userId}, Tenant: ${client.data.tenantContext.tenantId}`,
      );

      return true;
    } catch (error) {
      this.logger.warn(`WebSocket guard failed: ${error.message}`);
      throw new WsException('Authorization failed');
    }
  }
}
