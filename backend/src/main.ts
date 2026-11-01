import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { WsAuthAdapter } from './modules/notifications/infrastructure/websocket/ws-auth.adapter';
import { apiReference } from '@scalar/nestjs-api-reference';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : true,
    credentials: true,
  });

  app.useWebSocketAdapter(new WsAuthAdapter(app));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('CommunityHub API')
    .setDescription('The CommunityHub API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use('/api/reference', apiReference({
    content: document,
    theme: 'bluePlanet',
  }));



  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Docs (Scalar) is available on: http://localhost:${port}/api/reference`);
  console.log(`🔌 WebSocket available on: ws://localhost:${port}/notifications`);
}
bootstrap();
