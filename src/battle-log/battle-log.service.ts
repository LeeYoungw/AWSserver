import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BattleLog } from '../entities/battle-log.entity';
import { CreateBattleLogDto } from '../dto/battle-log.dto';
import { User } from '../entities/user.entity';
import { UserCard } from '../entities/user-card.entity';

@Injectable()
export class BattleLogService {
  constructor(
    @InjectRepository(BattleLog)
    private readonly battleLogRepository: Repository<BattleLog>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserCard)
    private readonly userCardRepository: Repository<UserCard>,
  ) {}

  // 배틀 로그 생성 
  async createBattleLog(createBattleLogDto: CreateBattleLogDto): Promise<BattleLog> {
    const { player1_id, player2_id, winner_id, trophies_change, card_change, gold_change } = createBattleLogDto;

    // 유저들 조회
    const player1 = await this.userRepository.findOne({ where: { id: player1_id } });
    const player2 = await this.userRepository.findOne({ where: { id: player2_id } });
    const winner = await this.userRepository.findOne({ where: { id: winner_id } });

    if (!player1 || !player2 || !winner) {
      throw new NotFoundException('유저 정보를 찾을 수 없습니다.');
    }

    // 배틀 로그 생성 및 저장
    const battleLog = this.battleLogRepository.create({
      player1,
      player2,
      winner,
      trophies_change,
      card_change,
      gold_change,
    });
    const savedBattleLog = await this.battleLogRepository.save(battleLog);

      // 승자와 패자에 대해 다르게 업데이트:
    // 승자는 골드와 트로피가 증가, 패자는 동일한 수치만큼 감소
    if (winner.id === player1.id) {
      player1.gold = (player1.gold || 0) + gold_change;
      player1.trophies = (player1.trophies || 0) + trophies_change;

      // player2: 패자
      player2.gold = (player2.gold || 0) - gold_change;
      player2.trophies = (player2.trophies || 0) - trophies_change;
    } else {
      player2.gold = (player2.gold || 0) + gold_change;
      player2.trophies = (player2.trophies || 0) + trophies_change;

      // player1: 패자
      player1.gold = (player1.gold || 0) - gold_change;
      player1.trophies = (player1.trophies || 0) - trophies_change;
    }
    // 두 유저 모두 저장
    await this.userRepository.save([player1, player2]);

    // player1과 player2의 보유 카드(UserCard) 모두의 usage_count를 1씩 증가시키기
    const usersToUpdate = [player1, player2];
    for (const user of usersToUpdate) {
      const userCards = await this.userCardRepository.find({ where: { user: { id: user.id } } });
      if (userCards.length > 0) {
        // 각 카드에 대해 usage_count 1 증가
        for (const userCard of userCards) {
          userCard.usage_count = (userCard.usage_count || 0) + 1;
        }
        await this.userCardRepository.save(userCards);
      }
    }
    // 전투에 참여한 두 유저의 보유 카드(UserCard) 중 랜덤으로 한 건씩 선택해서,
    // 해당 카드의 개수(quantity)를 1씩 증가시키기
    for (const user of [player1, player2]) {
      const userCards = await this.userCardRepository.find({ where: { user: { id: user.id } } });
      if (userCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * userCards.length);
        userCards[randomIndex].quantity += 1;
        await this.userCardRepository.save(userCards[randomIndex]);
      }
    }
    return savedBattleLog;
  }

  // 특정 두 유저 간의 배틀 로그 조회
  async getBattleLogs(player1Id: string, player2Id: string): Promise<BattleLog[]> {
    return await this.battleLogRepository.find({
      where: [
        { player1: { id: player1Id }, player2: { id: player2Id } },
        { player1: { id: player2Id }, player2: { id: player1Id } },
      ],
      order: { created_at: 'DESC' },
      relations: ['player1', 'player2', 'winner'],
    });
  }

  // 페이지네이션 기반 유저 전투 기록 조회 (민감 정보 제거 및 추가 정보 포함)
  async getBattleLogsByUser(userId: string, page = 1, limit = 10) {
    const query = this.battleLogRepository
      .createQueryBuilder('battle')
      .leftJoinAndSelect('battle.player1', 'player1')
      .leftJoinAndSelect('player1.decks', 'player1Decks')
      .leftJoinAndSelect('player1Decks.slots', 'player1Slots')
      .leftJoinAndSelect('player1Slots.card', 'player1Cards')
      .leftJoinAndSelect('battle.player2', 'player2')
      .leftJoinAndSelect('player2.decks', 'player2Decks')
      .leftJoinAndSelect('player2Decks.slots', 'player2Slots')
      .leftJoinAndSelect('player2Slots.card', 'player2Cards')
      .leftJoinAndSelect('battle.winner', 'winner')
      
  
      .where('player1.id = :userId OR player2.id = :userId', { userId })
      .orderBy('battle.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
  
    const [logs, total] = await query.getManyAndCount();
  
    if (total === 0) {
      return {
        message: '해당 유저의 전투 기록이 없습니다.',
        total,
        page,
        limit,
        data: [],
      };
    }
  
    const transformedLogs = logs.map(log => {
      const outcome = log.winner?.id === userId ? 'win' : 'loss';
      const isPlayer1 = log.player1.id === userId;
      const myDecks = isPlayer1 ? log.player1.decks : log.player2.decks;
      const opponentDecks = isPlayer1 ? log.player2.decks : log.player1.decks;
  
      const transformDecks = (decks: any[]) =>
        decks.map(deck => ({
          id: deck.id,
          name: deck.name,
          cards: deck.slots?.map(slot => ({
            id: slot.card?.id,
            name: slot.card?.name,
            level: slot.card?.level || null,
          })) || [],
        }));
  
      return {
        id: log.id,
        outcome,
        trophies_change: log.trophies_change,
        card_change: log.card_change,
        gold_change: log.gold_change,
        battle_record_time: log.created_at,
        my_decks: transformDecks(myDecks),
        opponent_decks: transformDecks(opponentDecks),
      };
    });
  
    return {
      data: transformedLogs,
    };
  }
  
}
