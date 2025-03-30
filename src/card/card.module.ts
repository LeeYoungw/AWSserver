// card.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { Card } from '../entities/card.entity';
import { UserCard } from '../entities/user-card.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card, UserCard, User])],
  controllers: [CardController],
  providers: [CardService],
  exports: [CardService],
})
export class CardModule {}