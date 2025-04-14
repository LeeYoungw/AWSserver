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
import { CardLevelStats } from './entities/card-level-stats.entity';
import { Card } from './entities/card.entity';
import { User } from './entities/user.entity';
import { BattleLog } from './entities/battle-log.entity';
import { BattlePass } from './entities/battle-pass.entity';
import { UserCard } from './entities/user-card.entity';
import { UserDeck } from './entities/user-deck.entity';
import { ShopItemsPool } from './entities/shop-items-pool.entity';
import { ShopPurchaseLog } from './entities/shop-purchase-log.entity';
import { BattleStatistics } from './entities/battle-statistics.entity';
import { BattlePassMission } from './entities/battle-pass-mission.entity';
import { BattlePassReward } from './entities/battle-pass-reward.entity';

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
      logging: false,
      entities: [
        Civilization,
        CardLevelStats,
        Card,
        User,
        BattleLog,
        BattlePass,
        UserCard,
        UserDeck,
        ShopItemsPool,
        ShopPurchaseLog,
        BattleStatistics,
        BattlePassMission,
        BattlePassReward,
      ],
    }),
    AuthModule,
    BattleLogModule,
    UserModule,
    ShopModule,
    DeckModule,
    CardModule,
    BattlePassModule,
    BattleStatisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

