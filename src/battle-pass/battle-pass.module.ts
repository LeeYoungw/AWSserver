import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BattlePass } from '../entities/battle-pass.entity';
import { BattlePassMission } from '../entities/battle-pass-mission.entity';
import { BattlePassReward } from '../entities/battle-pass-reward.entity';
import { User } from '../entities/user.entity';
import { BattlePassService } from './battle-pass.service';
import { BattlePassController } from './battle-pass.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BattlePass,
      BattlePassMission,
      BattlePassReward,
      User,
    ]),
  ],
  providers: [BattlePassService],
  controllers: [BattlePassController],
})
export class BattlePassModule {}
