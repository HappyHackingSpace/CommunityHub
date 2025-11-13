import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WsAuthAdapter } from './modules/notifications/infrastructure/websocket/ws-auth.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for both HTTP and WebSocket
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // Use custom WebSocket adapter with JWT authentication
  app.useWebSocketAdapter(new WsAuthAdapter(app));

  const config = new DocumentBuilder()
    .setTitle('CommunityHub API')
    .setDescription('The CommunityHub API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger UI is available on: http://localhost:${port}/api`);
  console.log(`🔌 WebSocket available on: ws://localhost:${port}/notifications`);
}
bootstrap();
