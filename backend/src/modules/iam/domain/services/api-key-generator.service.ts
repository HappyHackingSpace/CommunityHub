import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class ApiKeyGeneratorService {
  constructor(private readonly configService: ConfigService) {}

  generateKey(): string {
    const env = this.getEnvironment();
    const randomPart = randomBytes(24).toString('base64url');
    return `chb_${env}_${randomPart}`;
  }

 
  generateSecret(): string {
    return randomBytes(32).toString('base64url');
  }

  async hashSecret(plainSecret: string): Promise<string> {
    return bcrypt.hash(plainSecret, 10);
  }

 
  async verifySecret(plainSecret: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainSecret, hash);
  }


  private getEnvironment(): string {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'dev');
    switch (nodeEnv) {
      case 'production':
        return 'prod';
      case 'staging':
        return 'staging';
      default:
        return 'dev';
    }
  }
}
