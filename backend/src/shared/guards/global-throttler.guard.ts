import { ExecutionContext, Injectable } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Global rate-limiting guard, registered as APP_GUARD so the
 * ThrottlerModule configuration in AppModule is actually enforced.
 *
 * Routes that already apply their own ThrottlerGuard subclass via
 * `@UseGuards(...)` (e.g. ApiKeyThrottlerGuard, which must run after the
 * auth guards so it can key the limit on the resolved API key) are skipped
 * here, otherwise every request to those routes would be counted twice
 * against the same throttler storage.
 */
@Injectable()
export class GlobalThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ThrottlerGuard only understands HTTP requests; leave WebSocket and
    // other transports alone.
    if (context.getType() !== 'http') {
      return true;
    }

    if (this.hasRouteLevelThrottler(context)) {
      return true;
    }

    return super.canActivate(context);
  }

  private hasRouteLevelThrottler(context: ExecutionContext): boolean {
    const guards: unknown[] = [
      ...(Reflect.getMetadata(GUARDS_METADATA, context.getClass()) ?? []),
      ...(Reflect.getMetadata(GUARDS_METADATA, context.getHandler()) ?? []),
    ];

    return guards.some(
      (guard) =>
        guard instanceof ThrottlerGuard ||
        (typeof guard === 'function' &&
          guard.prototype instanceof ThrottlerGuard),
    );
  }
}
