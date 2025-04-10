import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ShopItemsPool } from '../entities/shop-items-pool.entity';
import { ShopPurchaseLog } from '../entities/shop-purchase-log.entity';
import { User } from '../entities/user.entity';
import { Card } from '../entities/card.entity';
import { UserCard } from '../entities/user-card.entity';
import { CurrencyType } from '../entities/enum';
import { MoreThan } from 'typeorm';
@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(ShopItemsPool) private readonly poolRepo: Repository<ShopItemsPool>,
    @InjectRepository(ShopPurchaseLog) private readonly logRepo: Repository<ShopPurchaseLog>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
    @InjectRepository(UserCard) private readonly userCardRepo: Repository<UserCard>,
  ) {}
  // 상점 아이템 생성성
  async generateShopItems(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // 기존 만료된 아이템 삭제
    await this.poolRepo.delete({ user: { id: userId }, expires_at: LessThan(new Date()) });

    const allCards = await this.cardRepo.find();
    const selectedCards = allCards.sort(() => 0.5 - Math.random()).slice(0, 5); // 5개 랜덤 카드

    const newItems = selectedCards.map((card) => {
      return this.poolRepo.create({
        user,
        card,
        quantity: Math.floor(Math.random() * 5) + 1,
        price: Math.floor(Math.random() * 200) + 50,
        currency: CurrencyType.GOLD,
        created_at: new Date(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간 후 만료
        is_purchased: false,
      });
    });
    return await this.poolRepo.save(newItems);
  }
  
  async getShopItems(userId: string) {
    const now = new Date();
    return this.poolRepo.find({
      where: { user: { id: userId }, expires_at: MoreThan(now) },
      relations: ['card'],
    });
  }

  async purchaseItem(userId: string, itemId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const item = await this.poolRepo.findOne({ where: { id: itemId }, relations: ['card', 'user'] });

    if (!user || !item) throw new Error('User or item not found');
    if (item.user.id !== userId) throw new Error('Item does not belong to user');
    if (item.is_purchased) throw new Error('Already purchased');

    // 가격 확인
    if (item.currency === CurrencyType.GOLD && user.gold < item.price) {
      throw new Error('Not enough gold');
    }

    // 골드 차감
    user.gold -= item.price;
    await this.userRepo.save(user);

    // 카드 지급 (이미 있으면 수량 증가)
    let userCard = await this.userCardRepo.findOne({ where: { user: { id: userId }, card: { id: item.card.id } } });
    if (userCard) {
      userCard.xp += item.quantity;
    } else {
      userCard = this.userCardRepo.create({ user, card: item.card, xp: item.quantity });
    }
    await this.userCardRepo.save(userCard);

    // 구매 로그 기록
    const log = this.logRepo.create({
      user,
      item,
      total_price: item.price,
      currency: item.currency,
    });
    await this.logRepo.save(log);

    // 아이템 구매 처리
    item.is_purchased = true;
    await this.poolRepo.save(item);

    return { message: '구매 완료', item, userCard };
  }
}
