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
  // 선택한 덱을 직접 조회
  const selectedDeck = await this.deckRepo.findOne({
    where: { id: deckId, user: { id: userId } },
    relations: ['slots', 'user'],
  });
  if (!selectedDeck) throw new NotFoundException('선택한 덱을 찾을 수 없습니다.');

  // 유저의 모든 덱 가져오기
  const userDecks = await this.deckRepo.find({
    where: { user: { id: userId } },
    relations: ['slots'],
  });

  // 덱 ID가 1인 덱 찾아오기
  const deckWithId1 = userDecks.find(deck => deck.id === 1);

  // 선택한 덱과 1번 덱이 다르면 슬롯 및 이름 교환
  if (deckWithId1 && deckWithId1.id !== selectedDeck.id) {
    // 슬롯 및 정보 교환
    const tempSlots = deckWithId1.slots;
    const tempName = deckWithId1.name;
    const tempIsSelected = deckWithId1.is_selected;

    deckWithId1.name = selectedDeck.name;
    deckWithId1.slots = selectedDeck.slots;
    deckWithId1.is_selected = selectedDeck.is_selected;

    selectedDeck.name = tempName;
    selectedDeck.slots = tempSlots;
    selectedDeck.is_selected = tempIsSelected;

    await this.deckRepo.save([deckWithId1, selectedDeck]);
  }

    for (const deck of userDecks) {
    deck.is_selected = (deck.id === 1);
  }
  await this.deckRepo.save(userDecks);

  return `덱 ID ${deckId}가 선택되었습니다.`;
}

}
