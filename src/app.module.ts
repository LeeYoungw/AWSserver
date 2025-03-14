<<<<<<< HEAD
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import * as admin from 'firebase-admin';
import { join } from 'path';

const serviceAccount = require(join(process.cwd(), 'my-firebase-key.json'));

// Firebase Admin SDK 초기화 (한 번만 호출)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
@Module({
  imports: [
    AuthModule, // Auth 모듈 추가
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost', // MySQL 서버 주소
      port: 3306, // MySQL 기본 포트
      username: 'root', // MySQL 계정
      password: 'sodksk12!@', // MySQL 비밀번호
      database: 'game_login_table', // 사용할 데이터베이스명
      synchronize: true, // 기존 테이블 유지
      autoLoadEntities: true, // 엔티티 자동 로드
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

=======
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import * as admin from 'firebase-admin';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';

const serviceAccount = require(join(process.cwd(), 'my-firebase-key.json'));

// Firebase Admin SDK 초기화 (한 번만 호출)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule, // Auth 모듈 추가
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost', // MySQL 서버 주소
      port: 3306, // MySQL 기본 포트
      username: 'root', // MySQL 계정
      password: 'sodksk12!@', // MySQL 비밀번호
      database: 'game_login_table', // 사용할 데이터베이스명
      synchronize: true, // 기존 테이블 유지
      autoLoadEntities: true, // 엔티티 자동 로드
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

>>>>>>> 4b8f998 (commit from ec2)
