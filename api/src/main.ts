import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common/services/logger.service';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.setGlobalPrefix('api/v1');

  // catch every unhandled/thrown error and return a consistent error shape
  app.useGlobalFilters(new AllExceptionsFilter());

  // set global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // enable swagger docs
  const config = new DocumentBuilder()
    .setTitle('Nest Commerce API')
    .setDescription('API documentation for Nest Commerce.')
    .setVersion('1.0')
    .addTag('Auth', 'Authentication related endpoints')
    .addTag('Users')
    .addTag('Categories')
    .addTag('Products')
    .addTag('Cart')
    .addTag('Orders')
    .addTag('Payments')
    .addTag('Addresses')
    .addTag('Reviews')
    .addTag('Meta')
    .addTag('Audits')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Refresh-JWT',
        description: 'Enter refresh JWT token',
        in: 'header',
      },
      'Refresh-JWT-auth',
    )
    // .addServer('http://localhost:3001', 'Development Server')
    .addServer(
      'https://nest-commerce-production-fa05.up.railway.app',
      'Production Server',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Nest Commerce API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customJsStr: `
    (function () {
      var meta = document.createElement('meta');
      meta.name = 'color-scheme';
      meta.content = 'light';
      document.head.appendChild(meta);
    })();
    `,
    customCss: `
    html {color-scheme: light only;}
    body {background: #fafafa;}
    .swagger-ui .topbar {display: none}
    .swagger-ui .info {margin: 50px 0;}
    .swagger-ui .info .title {color: #4A90E2;}
    `,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  Logger.error('Error starting the application', err);
  process.exit(1);
});
