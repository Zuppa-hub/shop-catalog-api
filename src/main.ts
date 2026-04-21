import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow configuring allowed origins via env; defaults to * for open APIs
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger is on by default; set DISABLE_SWAGGER=true to turn it off in prod
  if (process.env.DISABLE_SWAGGER !== 'true') {
    const config = new DocumentBuilder()
      .setTitle('Shop Catalog API')
      .setDescription('API for managing shop catalogs and products')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
  if (process.env.DISABLE_SWAGGER !== 'true') {
    console.log(`Swagger UI available at http://localhost:${port}/api`);
  }
}
bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
