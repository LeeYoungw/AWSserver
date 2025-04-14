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
    console.log('userId:', userId);
    console.log('page:', page);
    console.log('limit:', limit);
    
    // 플레이어1, 플레이어2의 덱 및 카드 정보를 함께 조회합니다.
    const [logs, total] = await this.battleLogRepository.findAndCount({
      where: [
        { player1: { id: userId } },
        { player2: { id: userId } }
      ],
      relations: [
        'player1', 'player1.decks', 'player1.decks.cards',
        'player2', 'player2.decks', 'player2.decks.cards',
        'winner'
      ],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    console.log('total:', total);
    console.log('logs:', logs);

    if (total === 0) {
      return {
        message: '해당 유저의 전투 기록이 없습니다.',
        total,
        page,
        limit,
        data: [],
      };
    }

    // 각 배틀 로그 데이터를 가공하여 응답에 필요한 정보만 반환합니다.
    const transformedLogs = logs.map(log => {
      // 승패 결과: 승자 id가 현재 유저이면 'win', 그렇지 않으면 'loss'
      const outcome = (log.winner && log.winner.id === userId) ? 'win' : 'loss';

      // 자기 덱과 상대 덱 구분
      // 타입을 명시적으로 지정해서 빈 배열을 선언합니다.
      let myDecks: any[] = [];
      let opponentDecks: any[] = [];
      if (log.player1.id === userId) {
        myDecks = log.player1.decks || [];
        opponentDecks = log.player2.decks || [];
      } else {
        myDecks = log.player2.decks || [];
        opponentDecks = log.player1.decks || [];
      }

      // 덱 정보 변환 함수: 각 덱의 id, name, 포함된 카드 정보(카드 id, name, level)를 추출합니다.
      const transformDecks = (decks: any[]) =>
        decks.map(deck => ({
          id: deck.id,
          name: deck.name,
          cards: deck.cards
            ? deck.cards.map(card => ({
                id: card.id,
                name: card.name,
                level: card.level || null,
              }))
            : [],
        }));

      return {
        id: log.id,
        outcome,                        // 승패 결과
        trophies_change: log.trophies_change,   // 트로피 증감
        card_change: log.card_change,             // 카드 변화
        gold_change: log.gold_change,             // 골드 변화
        battle_record_time: log.created_at,       // 전투 기록 시각
        my_decks: transformDecks(myDecks),         // 자기 덱 정보
        opponent_decks: transformDecks(opponentDecks), // 상대 덱 정보
      };
    });

    return {
      total,
      page,
      limit,
      data: transformedLogs,
    };
  }
}
