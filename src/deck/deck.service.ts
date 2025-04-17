import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserDeck } from '../entities/user-deck.entity';
import { DeckSlot } from '../entities/deck-slot.entity';
import { Card } from '../entities/card.entity';
import { CreateDeckDto, UpdateDeckSlotDto } from '../dto/deck.dto';

@Injectable()
export class DeckService {
  constructor(
    @InjectRepository(UserDeck) private deckRepo: Repository<UserDeck>,
    @InjectRepository(DeckSlot) private slotRepo: Repository<DeckSlot>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Card) private cardRepo: Repository<Card>,
  ) {}

  // 유저의 모든 덱 조회
  async getUserDecks(userId: string) {
    const decks = await this.deckRepo.find({
      where: { user: { id: userId } },
      relations: ['slots', 'slots.card'],
    });

    const transformedDecks = decks.map(deck => ({
      id: deck.id,
      name: deck.name,
      is_selected: deck.is_selected,
      slots: deck.slots.map(slot => ({
        slot: slot.slot,
        cardId: slot.card ? slot.card.id : null,
      })),
    }));

    return transformedDecks;
  }

  // 덱 생성: 첫 번째 덱이면 is_selected 자동 true
  async createDeck(dto: CreateDeckDto) {
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
      relations: ['decks'],
    });
    if (!user) throw new NotFoundException('User not found');

    const isFirstDeck = (user.decks.length === 0);

    const newDeck = this.deckRepo.create({
      user,
      name: dto.name ?? 'New Deck',
      is_selected: isFirstDeck,
    });

    return await this.deckRepo.save(newDeck);
  }

  // 덱 슬롯에 카드 추가 or 수정
  async updateDeckSlot(dto: UpdateDeckSlotDto) {
    const deck = await this.deckRepo.findOne({
      where: { id: dto.deckId, user: { id: dto.userId } },
    });
    if (!deck) throw new NotFoundException('Deck not found or does not belong to the user');

    const card = await this.cardRepo.findOne({ where: { id: dto.cardId } });
    if (!card) throw new NotFoundException('Card not found');

    const existingSlot = await this.slotRepo.findOne({
      where: { deck: { id: deck.id }, slot: dto.slot },
    });

    if (existingSlot) {
      existingSlot.card = card;
      return this.slotRepo.save(existingSlot);
    } else {
      const newSlot = this.slotRepo.create({
        deck,
        card,
        slot: dto.slot,
      });
      return this.slotRepo.save(newSlot);
    }
  }

  // UID와 덱 이름으로 덱 삭제
  async deleteDeckByName(userId: string, deckName: string): Promise<UserDeck> {
    const deck = await this.deckRepo.findOne({
      where: { user: { id: userId }, name: deckName },
    });
    if (!deck) throw new NotFoundException('해당 유저의 덱이 아니거나 존재하지 않습니다.');
    return this.deckRepo.remove(deck);
  }

  // 특정 덱 선택 (선택한 덱 외에는 is_selected = false 처리)
// 그리고 deckId가 1인 덱과 정보(이름, 슬롯 등) 교환
async selectDeck(userId: string, deckId: number): Promise<string> {
  const user = await this.userRepo.findOne({
    where: { id: userId },
    relations: ['decks'],
  });
  if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

  const selectedDeck = user.decks.find(deck => deck.id === deckId);
  if (!selectedDeck) throw new NotFoundException('선택한 덱을 찾을 수 없습니다.');

  const deckWithId1 = user.decks.find(deck => deck.id === 1);
  if (deckWithId1 && deckWithId1.id !== selectedDeck.id) {
    // 슬롯 포함 전체 덱 불러오기
    const fullDeckA = await this.deckRepo.findOne({ where: { id: selectedDeck.id }, relations: ['slots'] });
    const fullDeckB = await this.deckRepo.findOne({ where: { id: 1 }, relations: ['slots'] });

    if (!fullDeckA || !fullDeckB) throw new NotFoundException('덱 데이터를 완전히 가져오지 못했습니다.');

    // 슬롯 정보 백업
    const tempSlots = fullDeckA.slots;
    const tempName = fullDeckA.name;
    const tempSelected = fullDeckA.is_selected;

    // 서로 정보 바꾸기
    fullDeckA.name = fullDeckB.name;
    fullDeckA.is_selected = fullDeckB.is_selected;
    fullDeckA.slots = fullDeckB.slots;

    fullDeckB.name = tempName;
    fullDeckB.is_selected = tempSelected;
    fullDeckB.slots = tempSlots;

    await this.deckRepo.save([fullDeckA, fullDeckB]);
  }

  // 모든 덱 is_selected false로 초기화 후 선택한 덱만 true
  for (const deck of user.decks) {
    deck.is_selected = (deck.id === deckId);
  }
  await this.deckRepo.save(user.decks);

  return `덱 ID ${deckId}가 선택되었습니다.`;
}

}
