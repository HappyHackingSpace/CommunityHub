import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.getAllAndOverride<string[]>('scopes', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredScopes || requiredScopes.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;


    if (user?.authType !== 'api-key') {
      return true;
    }

    const userScopes = user.scopes || [];

    if (userScopes.includes('*')) {
      return true;
    }

    return requiredScopes.every(scope => userScopes.includes(scope));
  }
}
