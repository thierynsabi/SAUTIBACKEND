import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 3000);
  const prefix = configService.get<string>('APP_PREFIX', 'api/v1');

  app.setGlobalPrefix(prefix);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sauti - Citizen Engagement Platform')
    .setDescription('API for Tanzanian citizen engagement platform connecting citizens to their MPs.')
    .setVersion('2.0')
    .addBearerAuth()
    .addTag('Authentication', 'Phone + password authentication')
    .addTag('Users', 'User management (Admin)')
    .addTag('Profiles', 'User profiles')
    .addTag('Regions', 'Tanzania regions')
    .addTag('Districts', 'Districts within regions')
    .addTag('Constituencies', 'Constituencies within districts')
    .addTag('Wards', 'Wards within constituencies')
    .addTag('Issues', 'Citizen issue reports')
    .addTag('Comments', 'Issue comments and discussions')
    .addTag('Votes', 'Issue voting system')
    .addTag('Media', 'Issue media attachments')
    .addTag('MP Accounts', 'MP profile and constituency management')
    .addTag('Notifications', 'User notifications')
    .addTag('Announcements', 'MP announcements')
    .addTag('Promises', 'MP promises tracker')
    .addTag('Dashboard', 'Analytics and statistics')
    .addTag('Audit Logs', 'System audit trail (Admin)')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  Logger.log(`Sauti API v2 running on http://localhost:${port}/${prefix}`, 'Bootstrap');
  Logger.log(`Swagger docs at http://localhost:${port}/docs`, 'Bootstrap');
}
bootstrap();
