import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GoogleAuthGuard } from '../../infrastructure/guards/google-auth.guard';
import { RegisterUserCommand } from '../../application/commands/register-user/register-user.command';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly jwtService: JwtService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
  }

  @Get('google/callback')
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
    };
    const token = this.jwtService.sign(payload);

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user) {
    return user;
  }
}