import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeckController } from './deck.controller';
import { DeckService } from './deck.service';
import { User } from '../entities/user.entity';
import { UserDeck } from '../entities/user-deck.entity';
import { UserCard } from '../entities/user-card.entity';
import { Card } from '../entities/card.entity';
import { DeckSlot } from '../entities/deck-slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserDeck, UserCard, Card, DeckSlot])],
  controllers: [DeckController],
  providers: [DeckService],
})
export class DeckModule {}
