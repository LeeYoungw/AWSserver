import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ 글로벌 ValidationPipe 설정
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();

