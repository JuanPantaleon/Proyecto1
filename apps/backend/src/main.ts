/**
 * Ranked Fitness — Backend (NestJS)
 * Despliegue en Render: el puerto se toma de process.env.PORT (Render lo inyecta).
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

function corsOrigins(): (string | RegExp)[] {
  const raw = process.env.CORS_ORIGINS ?? '';
  const list = raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return [...list, /^http:\/\/localhost(:\d+)?$/];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';

  // CORS: acepta el dominio de Vercel (CORS_ORIGINS) + localhost para desarrollo.
  app.enableCors({
    origin: corsOrigins(),
    credentials: true,
  });

  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
