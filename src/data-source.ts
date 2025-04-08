import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { BattleLog } from './entities/battle-log.entity';
import { BattlePass } from './entities/battle-pass.entity';
import { Card } from './entities/card.entity';
import { UserCard } from './entities/user-card.entity';
import { UserDeck } from './entities/user-deck.entity';
import { DeckSlot } from './entities/deck-slot.entity';
import { ShopItemsPool } from './entities/shop-items-pool.entity';
import { ShopPurchaseLog } from './entities/shop-purchase-log.entity';
import { CardLevelStats } from './entities/card-level-stats.entity';
import { Civilization } from './entities/civilization.entity';
import { BattlePassMission } from './entities/battle-pass-mission.entity';
import { BattlePassReward } from './entities/battle-pass-reward.entity';
import { BattleStatistics } from './entities/battle-statistics.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'sodksk12!@',
  database: 'gametable',
  synchronize: false,
  logging: true,
  entities: [
    User,
    BattleLog,
    BattlePass,
    Card,
    UserCard,
    UserDeck,
    DeckSlot,
    ShopItemsPool,
    ShopPurchaseLog,
    CardLevelStats,
    Civilization,
    BattlePassMission, 
    BattlePassReward,
    BattleStatistics,  
  ],
  migrations: ['dist/src/migrations/*.js'],
  migrationsTableName: 'migrations',
});
