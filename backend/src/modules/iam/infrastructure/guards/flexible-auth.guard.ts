import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FlexibleAuthGuard implements CanActivate {
  private jwtGuard = new (AuthGuard('jwt'))();
  // API key auth is temporarily disabled.
  // private apiKeyGuard = new (AuthGuard('api-key'))();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    // API key auth is temporarily disabled.
    try {
      const result = this.jwtGuard.canActivate(context);
      const resolved = result instanceof Promise ? await result : result;
      return typeof resolved === 'boolean' ? resolved : await firstValueFrom(resolved);
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
