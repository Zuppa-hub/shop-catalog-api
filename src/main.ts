import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isProd = process.env.NODE_ENV === 'production';

  // Production: CORS_ORIGIN must be set explicitly — no implicit wildcard.
  // Development/test: open by default.
  if (isProd) {
    const origin = process.env.CORS_ORIGIN;
    if (!origin) {
      throw new Error(
        'CORS_ORIGIN environment variable must be set in production',
      );
    }
    app.enableCors({ origin });
  } else {
    app.enableCors();
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Production: Swagger is off by default; opt in with ENABLE_SWAGGER=true.
  // Development/test: always on.
  const swaggerEnabled = isProd ? process.env.ENABLE_SWAGGER === 'true' : true;

  if (swaggerEnabled) {
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
  if (swaggerEnabled) {
    console.log(`Swagger UI available at http://localhost:${port}/api`);
  }
}
bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
