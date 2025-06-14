import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BattleLog } from '../entities/battle-log.entity';
import { CreateBattleLogDto } from '../dto/battle-log.dto';
import { User } from '../entities/user.entity';
import { UserCard } from '../entities/user-card.entity';
import { DailyMissionService } from 'src/daily/dailymission.service';
import { UserDeck } from 'src/entities/user-deck.entity';

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

    private readonly dailyMissionService: DailyMissionService,
  ) {}

  async createBattleLog(createBattleLogDto: CreateBattleLogDto): Promise<BattleLog> {
  const {
    player1_id,
    player2_id,
    winner_id,
    trophies_change,
    card_change,
    gold_change,
  } = createBattleLogDto;

  const [player1, player2, winner] = await Promise.all([
    this.userRepository.findOne({ where: { id: player1_id } }),
    this.userRepository.findOne({ where: { id: player2_id } }),
    this.userRepository.findOne({ where: { id: winner_id } }),
  ]);

  if (!player1 || !player2 || !winner) {
    throw new NotFoundException('유저 정보를 찾을 수 없습니다.');
  }

  const [usedDeck1, usedDeck2] = await Promise.all([
    this.userdeckrepository.findOne({
      where: { user: { id: player1.id }, is_selected: true },
    }),
    this.userdeckrepository.findOne({
      where: { user: { id: player2.id }, is_selected: true },
    }),
  ]);

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

  //  트로피/골드 처리
  const winnerPlayer = winner.id === player1.id ? player1 : player2;
  const loserPlayer = winnerPlayer === player1 ? player2 : player1;

  winnerPlayer.gold += gold_change;
  winnerPlayer.trophies += trophies_change;
  winnerPlayer.today_win_count += 1;

  loserPlayer.gold -= gold_change;
  loserPlayer.trophies -= trophies_change;

  await this.userRepository.save([winnerPlayer, loserPlayer]);

  // 카드 사용량 증가 및 보상
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

  // 일일 미션 체크
  await this.dailyMissionService.evaluateWinMissions(winner.id);

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

  // ✅ 전체 결과 변환
  const transformedLogs = logs.map(log => {
    const isPlayer1 = log.player1.id === userId;
    const myDeck = isPlayer1 ? log.usedDeck1 : log.usedDeck2;
    const opponentDeck = isPlayer1 ? log.usedDeck2 : log.usedDeck1;

    return {
      id: log.id,
      outcome: log.winner?.id === userId ? 'win' : 'loss',
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
