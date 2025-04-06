import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { BattleLog } from '../entities/battle-log.entity';
import { UserDeck } from '../entities/user-deck.entity';
import { DeckSlot } from '../entities/deck-slot.entity';
import { Card } from '../entities/card.entity';
import { UserCard } from '../entities/user-card.entity';

@Injectable()
export class BattleStatisticsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(BattleLog) private readonly battleLogRepo: Repository<BattleLog>,
    @InjectRepository(UserDeck) private readonly userDeckRepo: Repository<UserDeck>,
    @InjectRepository(DeckSlot) private readonly deckSlotRepo: Repository<DeckSlot>,
    @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
    @InjectRepository(UserCard) private readonly userCardRepo: Repository<UserCard>,
  ) {}

  async getUserStatistics(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['cards', 'cards.card', 'decks', 'decks.slots', 'decks.slots.card'],
    });
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

    // 총 승리 수
    const totalWins = await this.battleLogRepo.count({
      where: { winner: { id: userId } },
    });

    // 선택된 덱 (1번 덱)
    const selectedDeck = user.decks.find((deck) => deck.is_selected);
    let averageMana = 0;
    let civName: string | null = null;

    if (selectedDeck && selectedDeck.slots.length > 0) {
      const totalMana = selectedDeck.slots.reduce((sum, slot) => {
        return sum + (slot.card?.mana_cost || 0);
      }, 0);
      averageMana = parseFloat((totalMana / selectedDeck.slots.length).toFixed(2));

      const civs = selectedDeck.slots
        .map((slot) => slot.card?.civilization?.name)
        .filter((v): v is string => !!v);

      if (civs.length > 0) {
        civName = civs
          .sort((a, b) => civs.filter((v) => v === a).length - civs.filter((v) => v === b).length)
          .pop() || null;
      }
    }

    // 자주 사용하는 카드 (battleLog.card_change 기준)
    const mostUsedCard = await this.battleLogRepo
      .createQueryBuilder('log')
      .leftJoin('log.player1', 'p1')
      .leftJoin('log.player2', 'p2')
      .where('p1.id = :id OR p2.id = :id', { id: userId })
      .select('log.card_change', 'cardId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.card_change')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne();

    const ownedCards = user.cards.length;

    return {
      totalWins,
      trophies: user.trophies,
      averageManaCost: averageMana,
      civilization: civName,
      deckName: selectedDeck?.name || '없음',
      mostUsedCardId: mostUsedCard?.cardId || null,
      ownedCardCount: ownedCards,
    };
  }

  private getMostFrequentCard(deckSlots: DeckSlot[]) {
    const freqMap = new Map<number, number>();
    for (const slot of deckSlots) {
      const cardId = slot.card.id;
      freqMap.set(cardId, (freqMap.get(cardId) || 0) + 1);
    }

    const mostUsed = [...freqMap.entries()].sort((a, b) => b[1] - a[1])[0];
    return mostUsed ? { cardId: mostUsed[0], count: mostUsed[1] } : null;
  }
}
