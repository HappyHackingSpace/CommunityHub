import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GoogleAuthGuard } from '../../infrastructure/guards/google-auth.guard';
import { RegisterUserCommand } from '../../application/commands/register-user/register-user.command';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from 'src/shared/infrastructure/decorators/current-user.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { TenantOptional } from 'src/shared/decorators/tenant-optional.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly jwtService: JwtService,
  ) {}

  @Get('google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
  }

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const { googleId, email, displayName, avatarUrl } = req.user;

    const user = await this.commandBus.execute(
      new RegisterUserCommand(googleId, email, displayName, avatarUrl),
    );

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      tenantId: user.primaryTenantId || null,
    };
    const token = this.jwtService.sign(payload);

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }

  @Get('profile')
  @TenantOptional()
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user) {
    return user;
  }
}