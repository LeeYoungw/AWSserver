import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../entities/user.entity';
import { BattlePass } from '../entities/battle-pass.entity';
import { DailyMission } from 'src/entities/daily_mission.entity';
import { UserDailyMission } from 'src/entities/user_daily_mission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,BattlePass,DailyMission,UserDailyMission]), 
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService], 
})
export class AuthModule {}
