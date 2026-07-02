import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { json } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase body size limit to 5MB for image uploads
  app.use(json({ limit: '5mb' }));

  // Enable CORS with credentials
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.BOOKING_ENGINE_URL || 'http://localhost:3002',
  ].filter(Boolean);
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'spa-id'],
  });

  // Add cookie parser middleware
  app.use(cookieParser());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('SPA Backend API')
    .setDescription(
      'Staff authentication, roles, permissions, and management APIs',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 8000);
  console.log(`API running on port ${process.env.PORT ?? 8000}`);
  console.log(
    `Swagger docs available at http://localhost:${process.env.PORT ?? 8000}/docs`,
  );
}

void bootstrap();
