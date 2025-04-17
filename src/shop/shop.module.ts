import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';

import { ShopItemsPool } from '../entities/shop-items-pool.entity';
import { ShopPurchaseLog } from '../entities/shop-purchase-log.entity';
import { Card } from '../entities/card.entity';
import { User } from '../entities/user.entity';
import { UserCard } from '../entities/user-card.entity';
import { CardModule } from '../card/card.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShopItemsPool,
      ShopPurchaseLog,
      Card,
      User,
      UserCard,
    ]),
    CardModule,
  ],
  controllers: [ShopController],
  providers: [ShopService],
})
export class ShopModule {}
