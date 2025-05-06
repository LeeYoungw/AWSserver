import { Injectable, NotFoundException } from '@nestjs/common';
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

  async createBattleLog(createBattleLogDto: CreateBattleLogDto): Promise<BattleLog> {
    const { player1_id, player2_id, winner_id, trophies_change, card_change, gold_change } = createBattleLogDto;

    const player1 = await this.userRepository.findOne({ where: { id: player1_id } });
    const player2 = await this.userRepository.findOne({ where: { id: player2_id } });
    const winner = await this.userRepository.findOne({ where: { id: winner_id } });

    if (!player1 || !player2 || !winner) {
      throw new NotFoundException('유저 정보를 찾을 수 없습니다.');
    }

    const battleLog = this.battleLogRepository.create({
      player1,
      player2,
      winner,
      trophies_change,
      card_change,
      gold_change,
    });
    const savedBattleLog = await this.battleLogRepository.save(battleLog);

    if (winner.id === player1.id) {
      player1.gold += gold_change;
      player1.trophies += trophies_change;
      player2.gold -= gold_change;
      player2.trophies -= trophies_change;
    } else {
      player2.gold += gold_change;
      player2.trophies += trophies_change;
      player1.gold -= gold_change;
      player1.trophies -= trophies_change;
    }

    await this.userRepository.save([player1, player2]);

    for (const user of [player1, player2]) {
      const userCards = await this.userCardRepository.find({ where: { user: { id: user.id } } });
      for (const userCard of userCards) {
        userCard.usage_count += 1;
      }
      await this.userCardRepository.save(userCards);
    }

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
        'player1.decks',
        'player1.decks.slots',
        'player1.decks.slots.card',
        'player2',
        'player2.decks',
        'player2.decks.slots',
        'player2.decks.slots.card',
        'winner',
      ],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  
    if (total === 0) {
      return {
        message: '해당 유저의 전투 기록이 없습니다.',
        total,
        page,
        limit,
        data: [],
      };
    }
  
    const transformDecks = (decks?: any[]) => {
      if (!Array.isArray(decks)) {
        return [];  // decks가 undefined/null이면 빈 배열 반환
      }
    
      return decks.map(deck => ({
        id: deck.id,
        name: deck.name,
        cards: Array.isArray(deck.slots)
          ? deck.slots.map(slot => ({
              id: slot.card?.id ?? null,
              name: slot.card?.name ?? null,
              level: slot.card?.level ?? null,
            }))
          : [],
      }));
    };
  
    const transformedLogs = logs.map(log => {
      const isPlayer1 = log.player1.id === userId;
      const myDecks = isPlayer1 ? log.player1.decks : log.player2.decks;
      const opponentDecks = isPlayer1 ? log.player2.decks : log.player1.decks;
  
      return {
        id: log.id,
        outcome: log.winner?.id === userId ? 'win' : 'loss',
        trophies_change: log.trophies_change,
        card_change: log.card_change,
        gold_change: log.gold_change,
        battle_record_time: log.created_at,
        my_decks: transformDecks(myDecks),
        opponent_decks: transformDecks(opponentDecks),
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
