import { Injectable, NotFoundException,ConflictException,BadRequestException } from '@nestjs/common';
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

  const transformedDecks = decks.map(deck => {
    const cards = deck.slots.filter(slot => slot.card != null).map(slot => slot.card);
    const totalMana = cards.reduce((sum, card) => sum + (card.manaCost ?? 0), 0);
    const averageManaCost = cards.length > 0 ? parseFloat((totalMana / cards.length).toFixed(2)) : 0;

    return {
      id: deck.id,
      name: deck.name,
      is_selected: deck.is_selected,
      averageManaCost,
      slots: deck.slots.map(slot => ({
        slot: slot.slot,
        cardId: slot.card?.id ?? null,
      })),
    };
  });

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


  async useCardInDeck(userId: string, deckId: number, cardId: number, replaceSlot?: number) {
  const deck = await this.deckRepo.findOne({
    where: { id: deckId, user: { id: userId } },
    relations: ['slots', 'slots.card'],
  });
  if (!deck) throw new NotFoundException('덱을 찾을 수 없습니다.');

  // 이미 덱에 있는 카드면 추가 못 함
  if (deck.slots.some(slot => slot.card.id === cardId)) {
    throw new BadRequestException('이미 덱에 포함된 카드입니다.');
  }

  const card = await this.cardRepo.findOne({ where: { id: cardId } });
  if (!card) throw new NotFoundException('카드를 찾을 수 없습니다.');

  const usedSlots = deck.slots.map(slot => slot.slot);
  const allSlots = Array.from({ length: 8 }, (_, i) => i);
  const emptySlot = allSlots.find(slot => !usedSlots.includes(slot));

  if (emptySlot !== undefined) {
    // 빈 슬롯이 있으면 바로 추가
    const newSlot = this.slotRepo.create({
      deck,
      card,
      slot: emptySlot,
    });
    return this.slotRepo.save(newSlot);
  }

  // 덱이 가득 찬 경우: replaceSlot이 있어야 함
  if (replaceSlot === undefined) {
    throw new ConflictException('덱이 가득 찼으며 교체할 슬롯이 지정되지 않았습니다.');
  }

  const targetSlot = await this.slotRepo.findOne({
    where: { deck: { id: deckId }, slot: replaceSlot },
  });
  if (!targetSlot) throw new NotFoundException(`슬롯 ${replaceSlot}이 존재하지 않습니다.`);

  targetSlot.card = card;
  return this.slotRepo.save(targetSlot);
}

  async removeCardFromSlot(userId: string, deckId: number, slot: number) {
  const deck = await this.deckRepo.findOne({
    where: { id: deckId, user: { id: userId } },
  });
  if (!deck) throw new NotFoundException('덱을 찾을 수 없습니다.');

  const deckSlot = await this.slotRepo.findOne({
    where: { deck: { id: deckId }, slot },
  });
  if (!deckSlot) throw new NotFoundException('해당 슬롯에 카드가 없습니다.');

  await this.slotRepo.remove(deckSlot);

  // 최신 상태 반환 (슬롯 제거된 상태)
  const updatedDeck = await this.deckRepo.findOne({
    where: { id: deckId },
    relations: ['slots', 'slots.card'],
  });

  return updatedDeck;
}



  // UID와 덱 이름으로 덱 삭제
async deleteDeckById(userId: string, deckId: number): Promise<UserDeck> {
  const deck = await this.deckRepo.findOne({
    where: { user: { id: userId }, id: deckId },
  });
  if (!deck) throw new NotFoundException('해당 유저의 덱이 아니거나 존재하지 않습니다.');
  return this.deckRepo.remove(deck);
}


  // 특정 덱 선택 (선택한 덱 외에는 is_selected = false 처리)
async selectDeck(userId: string, deckId: number): Promise<string> {
  // 선택한 덱 조회
  const selectedDeck = await this.deckRepo.findOne({
    where: { id: deckId, user: { id: userId } },
  });

  if (!selectedDeck) {
    throw new NotFoundException('선택한 덱을 찾을 수 없습니다.');
  }

  // 기존에 선택된 덱을 찾아서 false로 변경
  await this.deckRepo.update(
    { user: { id: userId }, is_selected: true },
    { is_selected: false },
  );

  // 선택한 덱을 true로 설정
  selectedDeck.is_selected = true;
  await this.deckRepo.save(selectedDeck);

  return `덱 ID ${deckId}가 선택되었습니다.`;
}

async copyDeck(userId: string, deckId: number) {
  const original = await this.deckRepo.findOne({
    where: { id: deckId, user: { id: userId } },
    relations: ['slots', 'user'],
  });

  if (!original) throw new NotFoundException('덱을 찾을 수 없습니다.');

  // 새로운 덱 객체 생성
  const newDeck = this.deckRepo.create({
    user: original.user,
    name: original.name + ' 복사본',
    is_selected: false,
  });

  await this.deckRepo.save(newDeck);

  // 슬롯 복사
  for (const slot of original.slots) {
    const newSlot = this.slotRepo.create({
      deck: newDeck,
      card: slot.card,
      slot: slot.slot,
    });
    await this.slotRepo.save(newSlot);
  }

  return newDeck;
}




}
