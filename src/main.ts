import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with credentials
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
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
