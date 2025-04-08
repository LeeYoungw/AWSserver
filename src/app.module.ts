import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import * as admin from 'firebase-admin';
import { join } from 'path';

// Firebase 설정
const serviceAccount = require(join(process.cwd(), 'my-firebase-key.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Feature Modules
import { BattleLogModule } from './battle-log/battle-log.module';
import { UserModule } from './Lobby/lobby.module';
import { ShopModule } from './shop/shop.module';
import { DeckModule } from './deck/deck.module';
import { CardModule } from './card/card.module';
import { BattlePassModule } from './battle-pass/battle-pass.module';
import { BattleStatisticsModule } from './battle-statistics/battle-statistics.module';
import { Civilization } from './entities/civilization.entity';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'sodksk12!@',
      database: 'gametable',
      synchronize: false,
      autoLoadEntities: true,
      logging: true,
    }),
    AuthModule,
    BattleLogModule,
    UserModule,
    ShopModule,
    DeckModule,
    CardModule,
    BattlePassModule,
    BattleStatisticsModule,
    Civilization,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

