import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import * as admin from 'firebase-admin';
import { join } from 'path';

import { BattleLog } from './entities/battle-log.entity';
import { BattlePass } from './entities/battle-pass.entity';
import { CardLevelStats } from './entities/card-level-stats.entity';
import { Card } from './entities/card.entity';
import { Civilization } from './entities/civilization.entity';
import { DeckSlot } from './entities/deck-slot.entity';
import { ShopItemsPool } from './entities/shop-items-pool.entity';
import { ShopPurchaseLog } from './entities/shop-purchase-log.entity';
import { User } from './entities/user.entity';
import { BattleLogModule } from './battle-log/battle-log.module';
import { UserModule } from './Lobby/lobby.module';
import { ShopModule } from './shop/shop.module';
import { DeckModule } from './deck/deck.module'; 
import { CardModule } from './card/card.module'; 
import { UserCard } from './entities/user-card.entity';
import { UserDeck } from './entities/user-deck.entity';

const serviceAccount = require(join(process.cwd(), 'my-firebase-key.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'sodksk12!@',
      database: 'gametable',
      synchronize: false,
      autoLoadEntities: true,
      entities: [BattleLog, BattlePass, CardLevelStats, Card, Civilization, DeckSlot, ShopItemsPool, ShopPurchaseLog, UserCard, UserDeck, User],
    }),
    BattleLogModule,
    UserModule,
    ShopModule,
    DeckModule,
    CardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
