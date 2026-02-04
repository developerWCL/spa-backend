import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
