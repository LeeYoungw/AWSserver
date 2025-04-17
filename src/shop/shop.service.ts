import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ShopItemsPool } from '../entities/shop-items-pool.entity';
import { ShopPurchaseLog } from '../entities/shop-purchase-log.entity';
import { User } from '../entities/user.entity';
import { Card } from '../entities/card.entity';
import { UserCard } from '../entities/user-card.entity';
import { CurrencyType } from '../entities/enum';
import { MoreThan } from 'typeorm';
import { CardService } from 'src/card/card.service';
@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(ShopItemsPool) private readonly poolRepo: Repository<ShopItemsPool>,
    @InjectRepository(ShopPurchaseLog) private readonly logRepo: Repository<ShopPurchaseLog>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
    @InjectRepository(UserCard) private readonly userCardRepo: Repository<UserCard>,

    private readonly cardService: CardService,
  ) {}
  // 상점 아이템 생성
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
    // 1. 사용자 및 아이템 조회
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const item = await this.poolRepo.findOne({ where: { id: itemId }, relations: ['card', 'user'] });
    if (!user || !item) throw new NotFoundException('User or item not found');
    if (item.user.id !== userId) throw new NotFoundException('Item does not belong to user');
    if (item.is_purchased) throw new Error('Already purchased');

    // 2. 가격 확인 및 골드 차감
    if (item.currency === CurrencyType.GOLD && user.gold < item.price) {
      throw new Error('Not enough gold');
    }
    user.gold -= item.price;
    await this.userRepo.save(user);

    // 3. 카드 획득 처리: CardService.acquireCard를 호출하여
    //    - 만약 이미 해당 카드가 있다면 수량이 증가하고,
    //    - 없으면 새로운 UserCard가 생성됩니다.
    const acquiredCard = await this.cardService.acquireCard({
      userId,
      cardId: item.card.id,
      quantity: item.quantity,
    });

    // 4. 구매 로그 기록
    const log = this.logRepo.create({
      user,
      item,
      total_price: item.price,
      currency: item.currency,
    });
    await this.logRepo.save(log);

    // 5. 아이템 구매 상태 업데이트
    item.is_purchased = true;
    await this.poolRepo.save(item);

    return { message: '구매 완료', item, userCard: acquiredCard };
  }
}
