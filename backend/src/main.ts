/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // CORS
  app.enableCors({
    origin: [
      configService.get('FRONTEND_URL'),
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    credentials: true,
  });

  // Aumentar límite de tamaño de payload para imágenes
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Servir archivos estáticos (imágenes)
  app.use('/uploads', express.static('uploads'));

  // Prefijo global para API
  app.setGlobalPrefix('api');

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Permitir propiedades no definidas pero no fallar
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('ERP Carnicerías API')
    .setDescription('API REST para sistema ERP de carnicerías')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticación y autorización')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const portNumber = Number(configService.get<number>('PORT') ?? 3000);
  await app.listen(portNumber);

  logger.log(`🚀 Aplicación corriendo en: http://localhost:${portNumber}`);
  logger.log(`📚 Documentación en: http://localhost:${portNumber}/api/docs`);
}

void bootstrap();
