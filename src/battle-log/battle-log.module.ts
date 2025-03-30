import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BattleLog } from '../entities/battle-log.entity'; // 배틀로그 엔티티
import { BattleLogService } from './battle-log.service'; // 배틀로그 서비스
import { BattleLogController } from './battle-log.controller'; // 배틀로그 컨트롤러
import { User } from '../entities/user.entity';
@Module({
  imports: [TypeOrmModule.forFeature([BattleLog,User])], // TypeORM에서 BattleLog 엔티티를 등록
  controllers: [BattleLogController], // 컨트롤러 추가
  providers: [BattleLogService], // 서비스 추가
  exports: [BattleLogService], // 다른 모듈에서도 사용할 수 있도록 export
})
export class BattleLogModule {}
