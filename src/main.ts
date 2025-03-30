import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';

const SWAGGER_FILE = join(__dirname, 'swagger.json');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
  .setTitle('Game Login API')
  .setDescription('게임 로그인 API 문서')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);

  // ✅ 글로벌 ValidationPipe 설정
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();

