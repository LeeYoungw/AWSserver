import { Injectable } from '@nestjs/common';
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
    return this.deckRepo.find({
      where: { user: { id: userId } },
      relations: ['slots', 'slots.card'],
    });
  }

  //  덱 생성
  async createDeck(dto: CreateDeckDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new Error('User not found');

    const newDeck = this.deckRepo.create({ user, name: dto.name ?? 'New Deck' });
    return this.deckRepo.save(newDeck);
  }

  //  덱 슬롯에 카드 추가 or 수정
  async updateDeckSlot(dto: UpdateDeckSlotDto) {
    const deck = await this.deckRepo.findOne({
      where: { id: dto.deckId, user: { id: dto.userId } },
    });
    if (!deck) throw new Error('Deck not found or does not belong to the user');

    const card = await this.cardRepo.findOne({ where: { id: dto.cardId } });
    if (!card) throw new Error('Card not found');

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

  //  덱 삭제
  async deleteDeck(deckId: number, userId: string) {
    const deck = await this.deckRepo.findOne({
      where: { id: deckId, user: { id: userId } },
    });
    if (!deck) throw new Error('해당 유저의 덱이 아니거나 존재하지 않음');

    return this.deckRepo.remove(deck);
  }
}
