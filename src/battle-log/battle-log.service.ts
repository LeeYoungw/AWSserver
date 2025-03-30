import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BattleLog } from '../entities/battle-log.entity';
import { CreateBattleLogDto } from '../dto/battle-log.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class BattleLogService {
  constructor(
    @InjectRepository(BattleLog)
    private readonly battleLogRepository: Repository<BattleLog>,
    
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 배틀 로그 
  async createBattleLog(createBattleLogDto: CreateBattleLogDto): Promise<BattleLog> {
    const { player1_id, player2_id, winner_id, trophies_change, card_change, gold_change } = createBattleLogDto;

    // player1, player2, winner 유저 찾기
    const player1 = await this.userRepository.findOne({ where: { id: player1_id } });
    const player2 = await this.userRepository.findOne({ where: { id: player2_id } });
    const winner = await this.userRepository.findOne({ where: { id: winner_id } });

    if (!player1 || !player2 || !winner) {
      throw new Error('유저 정보가 올바르지 않습니다.');
    }

    // 배틀 로그 저장
    const battleLog = this.battleLogRepository.create({
      player1,
      player2,
      winner,
      trophies_change,
      card_change,
      gold_change,
    });

    return await this.battleLogRepository.save(battleLog);
  }

  // 특정 두 유저의 배틀 로그 조회
  async getBattleLogs(player1Id: string, player2Id: string): Promise<BattleLog[]> {
    return await this.battleLogRepository.find({
      where: [
        { player1: { id: player1Id }, player2: { id: player2Id } },
        { player1: { id: player2Id }, player2: { id: player1Id } },
      ],
      order: { created_at: 'DESC' },
      relations: ['player1', 'player2', 'winner'], // 유저 정보 포함
    });
  }
}

