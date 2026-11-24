import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cookieParser());

  const configuredOrigins = (
    process.env.CORS_ORIGIN ||
    'http://localhost:3000,http://localhost:3001,https://findfunlinks.vercel.app,https://findfunlinks-web.vercel.app,https://findfunlinks-admin.vercel.app'
  )
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/$/, '');

      // Check if origin is explicitly configured or wildcard is set
      if (
        configuredOrigins.includes('*') ||
        configuredOrigins.includes(normalizedOrigin) ||
        process.env.CORS_ORIGIN === '*'
      ) {
        return callback(null, true);
      }

      // Automatically allow all Vercel deployments (*.vercel.app)
      const isVercel = /^https:\/\/([a-z0-9-_.]+)\.vercel\.app$/i.test(normalizedOrigin);
      // Automatically allow localhost development ports
      const isLocalhost = /^https?:\/\/(localhost|127\.0.0\.1)(:\d+)?$/i.test(normalizedOrigin);

      if (isVercel || isLocalhost) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-csrf-token',
      'x-request-id',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1');

  // Swagger Documentation
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('FinalLinks API')
      .setDescription(
        'Production REST API for FinalLinks directory, Super Admin, and Website Owner portals',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('refresh_token')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 FinalLinks API running on http://localhost:${port}/api/v1`);
  console.log(`📄 Swagger documentation at http://localhost:${port}/docs`);
}

bootstrap();
