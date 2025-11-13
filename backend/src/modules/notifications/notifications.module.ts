// src/modules/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Repositories
import { NotificationRepository } from './infrastructure/persistence/notification.repository';
import { NotificationPreferenceRepository } from './infrastructure/persistence/notification-preference.repository';
import { NotificationTemplateRepository } from './infrastructure/persistence/notification-template.repository';

// Services
import { NotificationService } from './application/services/notification.service';
import { NotificationPreferenceService } from './application/services/notification-preference.service';

// Queue
import { NotificationQueueService, NOTIFICATION_QUEUE } from './infrastructure/queue/notification-queue.service';
import { NotificationProcessor } from './infrastructure/queue/notification.processor';

// WebSocket
import { NotificationsGateway } from './infrastructure/websocket/notifications.gateway';
import { NotificationWebSocketService } from './infrastructure/websocket/notification-websocket.service';
import { WsJwtAuthGuard } from './infrastructure/websocket/ws-jwt-auth.guard';

// Event Handlers
import {
  TaskAssignedHandler,
  TaskCommentAddedHandler,
  MeetingCreatedHandler,
  ParticipantAddedHandler,
} from './application/event-handlers';

// Controllers
import { NotificationsController } from './presentation/controllers/notifications.controller';
import { NotificationPreferencesController } from './presentation/controllers/notification-preferences.controller';
import { NotificationPreferenceSchema, NotificationSchema, NotificationTemplateSchema } from './infrastructure/persistence';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationSchema,
      NotificationPreferenceSchema,
      NotificationTemplateSchema,
    ]),
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: '1d' },
        };
      },
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [NotificationsController, NotificationPreferencesController],
  providers: [
    // Repository providers with string tokens
    {
      provide: 'INotificationRepository',
      useClass: NotificationRepository,
    },
    {
      provide: 'INotificationPreferenceRepository',
      useClass: NotificationPreferenceRepository,
    },
    {
      provide: 'INotificationTemplateRepository',
      useClass: NotificationTemplateRepository,
    },
    // Services
    NotificationService,
    NotificationPreferenceService,
    NotificationQueueService,
    NotificationProcessor,
    // WebSocket
    NotificationsGateway,
    NotificationWebSocketService,
    WsJwtAuthGuard,
    // Event Handlers
    TaskAssignedHandler,
    TaskCommentAddedHandler,
    MeetingCreatedHandler,
    ParticipantAddedHandler,
  ],
  exports: [
    NotificationService,
    NotificationPreferenceService,
    NotificationWebSocketService,
  ],
})
export class NotificationsModule {}
