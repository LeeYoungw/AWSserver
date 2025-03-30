import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LobbyService } from './lobby.service';
import { LobbyController } from './lobby.controller';
import { User } from '../entities/user.entity';
import { BattleLog } from '../entities/battle-log.entity';
import { BattlePass } from '../entities/battle-pass.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, BattleLog, BattlePass])],
  providers: [LobbyService],
  controllers: [LobbyController],
})
export class UserModule {}
