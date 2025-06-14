// match.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchStatus } from 'src/entities/match_status.entity';
import { UserDeck } from '../entities/user-deck.entity';
import { UserCard } from '../entities/user-card.entity';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchStatus, UserDeck, UserCard]),
  ],
  controllers: [MatchController],
  providers: [MatchService],
})
export class MatchModule {}
