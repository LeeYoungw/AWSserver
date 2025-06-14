import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyMissionController } from './dailymission.controller';
import { DailyMissionService } from './dailymission.service';
import { User } from '../entities/user.entity';
import { DailyMission } from '../entities/daily_mission.entity';
import { UserDailyMission } from '../entities/user_daily_mission.entity';
import { BattleLog } from 'src/entities/battle-log.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, DailyMission, UserDailyMission, BattleLog]),
  ],
  controllers: [DailyMissionController],
  providers: [DailyMissionService],
  exports: [DailyMissionService],
})
export class DailyMissionModule {}
