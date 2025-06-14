import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { BattleLog } from '../entities/battle-log.entity';
import { BattlePass } from '../entities/battle-pass.entity';

@Injectable()
export class LobbyService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(BattleLog)
    private readonly battleLogRepository: Repository<BattleLog>,

    @InjectRepository(BattlePass)
    private readonly battlePassRepository: Repository<BattlePass>,
  ) {}

  async getUserProfile(uid: string) {
    // 1. 유저 기본 정보 조회
    const user = await this.userRepository.findOne({ where: { id: uid } });
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }
    // 2. 배틀 패스 조회
    const battlePass = await this.battlePassRepository.findOne({
      where: { user: { id: uid } },
    });

    return {
      id: user.id,
      nickname : user.user_nickname,
      email: user.email,
      level: user.level,
      exp: user.exp,
      trophies: user.trophies,
      gold: user.gold,
      diamond: user.diamond,
      last_login: user.last_login,
      streak: user.streak,
      total_attendance: user.total_attendance,
      battle_pass: battlePass
        ? {
            level: battlePass.battle_pass_level,
            xp: battlePass.battle_pass_xp,
            is_premium: !!battlePass.is_premium,
          }
        : null,
    };
  }
}
