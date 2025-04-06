import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BattleStatisticsController } from './battle-statistics.controller';
import { BattleStatisticsService } from './battle-statistics.service';
import { User } from '../entities/user.entity';
import { BattleLog } from '../entities/battle-log.entity';
import { UserDeck } from '../entities/user-deck.entity';
import { DeckSlot } from '../entities/deck-slot.entity';
import { Card } from '../entities/card.entity';
import { UserCard } from '../entities/user-card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, BattleLog, UserDeck, DeckSlot, Card, UserCard])],
  controllers: [BattleStatisticsController],
  providers: [BattleStatisticsService],
})
export class BattleStatisticsModule {}
