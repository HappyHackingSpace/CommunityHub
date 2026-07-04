// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { IamModule } from './modules/iam/iam.module';
import { CommunitiesModule } from './modules/communities/communities.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { ActivityFeedModule } from './modules/activity-feed/activity-feed.module';
import { SecurityModerationModule } from './modules/security-moderation/security-moderation.module';
import { MultiTenantModule } from './shared/multi-tenant/multi-tenant.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
        logging: 'all',
              }),
      inject: [ConfigService],
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('DataSource options are undefined');
        }
        const dataSource = new DataSource(options);
        await dataSource.initialize();
        return dataSource;
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, 
        limit: 10, 
      },
      {
        name: 'medium',
        ttl: 300000, 
        limit: 50, 
      },
      {
        name: 'long',
        ttl: 3600000, 
        limit: 100, 
      },
    ]),
    MultiTenantModule,
    IamModule,
    CommunitiesModule,
    MeetingsModule,
    TasksModule,
    NotificationsModule,
    ClubsModule,
    ActivityFeedModule,
    SecurityModerationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}