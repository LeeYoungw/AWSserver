import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BattleLog } from '../entities/battle-log.entity'; 
import { BattleLogService } from './battle-log.service'; 
import { BattleLogController } from './battle-log.controller'; 
import { User } from '../entities/user.entity';
import { UserCard } from 'src/entities/user-card.entity';
@Module({
  imports: [TypeOrmModule.forFeature([BattleLog,User,UserCard])], 
  controllers: [BattleLogController],
  providers: [BattleLogService], 
  exports: [BattleLogService], 
})
export class BattleLogModule {}
