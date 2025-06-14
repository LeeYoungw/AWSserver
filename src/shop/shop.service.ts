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
import { ShopItemResponseDto, PurchaseResponseDto } from 'src/dto/response/shopItem-response.dto';
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
async generateShopItems(userId: string): Promise<ShopItemResponseDto[]> {
  const user = await this.userRepo.findOne({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  await this.poolRepo.delete({
    user: { id: userId },
    expires_at: LessThan(new Date()),
  });

  const allCards = await this.cardRepo.find();
  const selectedCards = allCards.sort(() => 0.5 - Math.random()).slice(0, 5);

  const newItems = selectedCards.map((card) => {
    return this.poolRepo.create({
      user,
      card,
      quantity: Math.floor(Math.random() * 5) + 1,
      price: Math.floor(Math.random() * 200) + 50,
      currency: CurrencyType.GOLD,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      is_purchased: false,
    });
  });

  const savedItems = await this.poolRepo.save(newItems);

  return savedItems.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    price: item.price,
    currency: item.currency,
    created_at: item.created_at.toISOString(),   
    expires_at: item.expires_at.toISOString(),   
    is_purchased: item.is_purchased,
    card_id: item.card.id,
    card_name: item.card.name,
  }));
}

  async getShopItems(userId: string): Promise<ShopItemResponseDto[]> {
  const now = new Date();
  const items = await this.poolRepo.find({
    where: { user: { id: userId }, expires_at: MoreThan(now) },
    relations: ['card'],
  });

  return items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    price: item.price,
    currency: item.currency,
    created_at : item.created_at.toISOString(),
    expires_at: item.expires_at.toISOString(),
    is_purchased: item.is_purchased,
    card_id: item.card.id,
    card_name: item.card.name,
  }));
}

async purchaseItem(userId: string, itemId: number): Promise<PurchaseResponseDto> {
  const user = await this.userRepo.findOne({ where: { id: userId } });
  const item = await this.poolRepo.findOne({ where: { id: itemId }, relations: ['card', 'user'] });
  if (!user || !item) throw new NotFoundException('User or item not found');
  if (item.user.id !== userId) throw new NotFoundException('Item does not belong to user');
  if (item.is_purchased) throw new Error('Already purchased');

  if (item.currency === CurrencyType.GOLD && user.gold < item.price) {
    throw new Error('Not enough gold');
  }
  user.gold -= item.price;
  await this.userRepo.save(user);

  const acquiredCard = await this.cardService.acquireCard({
    userId,
    cardId: item.card.id,
    quantity: item.quantity,
  });

  const log = this.logRepo.create({
    user,
    item,
    total_price: item.price,
    currency: item.currency,
  });
  await this.logRepo.save(log);

  item.is_purchased = true;
  await this.poolRepo.save(item);

  return {
    message: '구매 완료',
    item: {
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      currency: item.currency,
      created_at: item.created_at.toISOString(),
      expires_at: item.expires_at.toISOString(),
      is_purchased: item.is_purchased,
      card_id: item.card.id,
      card_name: item.card.name,
    },
    userCard: acquiredCard,
  };
}
}
