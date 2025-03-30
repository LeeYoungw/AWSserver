import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../entities/card.entity';
import { UserCard } from '../entities/user-card.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card) private cardRepo: Repository<Card>,
    @InjectRepository(UserCard) private userCardRepo: Repository<UserCard>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}
  // 유저의 모든 카드 가져옴
  async getUserCards(userId: string, type?: string) {
    const query = this.userCardRepo.createQueryBuilder('uc')
      .leftJoinAndSelect('uc.card', 'card')
      .where('uc.userId = :userId', { userId });

    if (type) {
      query.andWhere('card.type = :type', { type });
    }

    return query.getMany();
  }
  // 카드 정보 
  async getCardDetail(cardId: number) {
    return this.cardRepo.findOne({ where: { id: cardId } });
  }
  // 카드 업그레이드
  async upgradeCard(userId: string, cardId: number) {
    const userCard = await this.userCardRepo.findOne({
      where: { user: { id: userId }, card: { id: cardId } },
      relations: ['card', 'user'],
    });

    if (!userCard) throw new Error('해당 카드를 보유하고 있지 않습니다');

    // 임시 조건: 5개 이상 보유 시 업그레이드 가능
    if (userCard.xp < 5) throw new Error('카드 업그레이드 조건을 충족하지 않습니다');

    userCard.level += 1;
    userCard.xp -= 5;
    return this.userCardRepo.save(userCard);
  }
}