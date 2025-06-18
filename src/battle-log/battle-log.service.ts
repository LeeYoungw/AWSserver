import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BattleLog } from '../entities/battle-log.entity';
import { CreateBattleLogDto } from '../dto/battle-log.dto';
import { User } from '../entities/user.entity';
import { UserCard } from '../entities/user-card.entity';
import { DailyMissionService } from 'src/daily/dailymission.service';
import { UserDeck } from 'src/entities/user-deck.entity';
import { MatchStatus } from 'src/entities/match_status.entity';
@Injectable()
export class BattleLogService {
  constructor(
    @InjectRepository(BattleLog)
    private readonly battleLogRepository: Repository<BattleLog>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserDeck)
    private readonly userdeckrepository:
    Repository<UserDeck>,

    @InjectRepository(UserCard)
    private readonly userCardRepository: Repository<UserCard>,

    @InjectRepository(MatchStatus)
    private readonly matchRepo: Repository<MatchStatus>,

    private readonly dailyMissionService: DailyMissionService,
  ) {}

async createBattleLogFromWinner(dto: CreateBattleLogDto): Promise<BattleLog> {
  const { winnerId, isDraw } = dto;

  // 매칭 정보 조회
  const match = await this.matchRepo.findOne({
    where: { playerId: winnerId },
  });

  if (!match || !match.opponentId) {
    throw new NotFoundException('매칭 정보가 없습니다.');
  }

  const player1_id = winnerId;
  const player2_id = match.opponentId;

  // 유저 조회
  const [player1, player2] = await Promise.all([
    this.userRepository.findOne({ where: { id: player1_id } }),
    this.userRepository.findOne({ where: { id: player2_id } }),
  ]);

  if (!player1 || !player2) {
    throw new NotFoundException('유저 정보를 찾을 수 없습니다.');
  }

  // 무승부가 아니라면 승자 설정
  const winner = isDraw ? null : player1;

  // 사용한 덱 조회
  const [usedDeck1, usedDeck2] = await Promise.all([
    this.userdeckrepository.findOne({
      where: { user: { id: player1.id }, is_selected: true },
    }),
    this.userdeckrepository.findOne({
      where: { user: { id: player2.id }, is_selected: true },
    }),
  ]);

  // 보상 설정
  const trophies_change = 30;
  const card_change = 1;
  const gold_change = 100;

  // 배틀 로그 생성
  const battleLog = this.battleLogRepository.create({
    player1,
    player2,
    winner,
    trophies_change,
    card_change,
    gold_change,
    usedDeck1,
    usedDeck2,
  } as Partial<BattleLog>);

  const savedBattleLog = await this.battleLogRepository.save(battleLog);

  // 승패/무승부에 따른 보상 처리
  if (!isDraw && winner) {
    const loser = winner.id === player1.id ? player2 : player1;

    winner.gold += gold_change;
    winner.trophies += trophies_change;
    winner.today_win_count += 1;

    loser.gold -= gold_change;
    loser.trophies -= trophies_change;

    await this.userRepository.save([winner, loser]);
  } else {
    const halfGold = Math.floor(gold_change / 2);
    const halfTrophies = Math.floor(trophies_change / 2);

    player1.gold += halfGold;
    player2.gold += halfGold;

    player1.trophies += halfTrophies;
    player2.trophies += halfTrophies;

    await this.userRepository.save([player1, player2]);
  }

  // 카드 사용량 증가 및 보상 처리
  await Promise.all(
    [player1, player2].map(async (user) => {
      const userCards = await this.userCardRepository.find({
        where: { user: { id: user.id } },
      });

      userCards.forEach((card) => {
        card.usage_count += 1;
      });

      if (userCards.length > 0) {
        const randomCard = userCards[Math.floor(Math.random() * userCards.length)];
        randomCard.quantity += 1;
      }

      await this.userCardRepository.save(userCards);
    }),
  );

  // 미션 평가 (무승부가 아닐 때만)
  if (!isDraw && winner) {
    await this.dailyMissionService.evaluateWinMissions(winner.id);
  }

  //match_status 삭제
  await this.matchRepo.delete({ playerId: winnerId });
await this.matchRepo.delete({ playerId: match.opponentId });

  return savedBattleLog;
}





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

 async getBattleLogsByUser(userId: string, page = 1, limit = 10) {
  const [logs, total] = await this.battleLogRepository.findAndCount({
    where: [
      { player1: { id: userId } },
      { player2: { id: userId } },
    ],
    relations: [
      'player1',
      'player2',
      'winner',
      'usedDeck1',
      'usedDeck1.slots',
      'usedDeck1.slots.card',
      'usedDeck2',
      'usedDeck2.slots',
      'usedDeck2.slots.card',
    ],
    order: { created_at: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });

  //  유저 카드에서 카드 ID별 레벨 맵 만들기
  const userCards = await this.userCardRepository.find({
    where: { user: { id: userId } },
    relations: ['card'],
  });
  const cardLevelMap = new Map<number, number>();
  userCards.forEach(uc => {
    if (uc.card?.id != null) {
      cardLevelMap.set(uc.card.id, uc.level);
    }
  });

  //  덱 변환 함수 (레벨 적용)
  const transformDeck = (deck?: any) => {
    if (!deck) return null;
    return {
      id: deck.id,
      name: deck.name,
      cards: deck.slots?.map(slot => {
        const cardId = slot.card?.id ?? null;
        return {
          id: cardId,
          name: slot.card?.name ?? null,
          level: cardLevelMap.get(cardId) ?? null,
        };
      }) || [],
    };
  };

  const transformedLogs = logs.map(log => {
  const isPlayer1 = log.player1.id === userId;
  const myDeck = isPlayer1 ? log.usedDeck1 : log.usedDeck2;
  const opponentDeck = isPlayer1 ? log.usedDeck2 : log.usedDeck1;

  return {
    id: log.id,
    outcome: log.winner === null
      ? 'draw'
      : log.winner.id === userId
        ? 'win'
        : 'loss',
    trophies_change: log.trophies_change,
    battle_record_time: log.created_at,
    my_deck: transformDeck(myDeck),
    opponent_deck: transformDeck(opponentDeck),
  };
});


  return {
    total,
    data: transformedLogs,
  };
}

}
