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

    // 2. 배틀 로그 조회 -> 이것도 수정?
    const battleLogs = await this.battleLogRepository.find({
      where: [
        { player1: { id: uid } },
        { player2: { id: uid } },
      ],
      relations: ['player1', 'player2', 'winner'],
      order: { created_at: 'DESC' },
    });

    // 3. 배틀 패스 조회
    const battlePass = await this.battlePassRepository.findOne({
      where: { user: { id: uid } },
    });
    // 수정해야 할 부분들?
    return {
      id: user.id,
      email: user.email,
      level: user.level,
      exp: user.exp,
      trophies: user.trophies,
      gold: user.gold,
      diamond: user.diamond,
      last_login: user.last_login,
      created_at: user.created_at,
      streak: user.streak,
      total_attendance: user.total_attendance,
      battle_logs: battleLogs,
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

