import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import type { ICommunityMemberRepository } from 'src/modules/communities/domain/repositories/community-member.repository.interface';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  tenantId?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    @Inject('ICommunityMemberRepository')
    private communityMemberRepository: ICommunityMemberRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findById(payload.sub);

    if (!user || !user.isActive()) {
      throw new UnauthorizedException();
    }

    const tenants = await this.communityMemberRepository.findUserTenantsWithCommunityInfo(user.id);

    return {
      id: user.id,
      userId: user.id,
      email: user.email,
      roles: user.roles,
      globalRole: user.roles[0] || 'USER',
      tenantId: payload.tenantId,
      tenants,
    };
  }
}