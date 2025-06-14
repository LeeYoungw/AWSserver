import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../entities/card.entity';
import { UserCard } from '../entities/user-card.entity';
import { User } from '../entities/user.entity';
import { AcquireCardDto } from '../dto/AcquireCard.dto';
import { CardDetailResponseDto } from 'src/dto/response/card-detail-response.dto';
import { Civilization } from 'src/entities/civilization.entity';
import { UpgradeCardResponseDto,UserCardsWithTotalDto,UserCardResponseDto } from 'src/dto/response/UserCard-response.dto';
@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,

    @InjectRepository(UserCard)
    private readonly userCardRepo: Repository<UserCard>,

    @InjectRepository(Card)
    private readonly cardrepository: Repository<Card>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // 유저의 모든 카드 가져옴
async getUserCards(userId: string, type?: string): Promise<UserCardsWithTotalDto> {
  const query = this.userCardRepo.createQueryBuilder('uc')
    .leftJoinAndSelect('uc.card', 'card')
    .where('uc.userId = :userId', { userId });

  if (type) {
    query.andWhere('card.type = :type', { type });
  }

  const userCards = await query.getMany();
  const totalCardCount = await this.cardRepo.count(); // 전체 카드 개수

  return {
    totalCardsInGame: totalCardCount,
    userOwnedCardCount: userCards.length,
    userCards: userCards.map((uc) => ({
      id: uc.id,
      level: uc.level,
      quantity: uc.quantity,
      upgradeable: uc.quantity >= 5,
      card: {
        id: uc.card.id,
        name: uc.card.name,
        type: uc.card.type,
      },
    })),
  };
}



  async getCardDetail(cardId: number): Promise<CardDetailResponseDto> {
  const card = await this.cardrepository.findOne({
    where: { id: cardId },
    relations: ['civilization'], // 문명 조인
  });

  if (!card) throw new NotFoundException('카드를 찾을 수 없습니다.');

  return {
    id: card.id,
    name: card.name,
    type: card.type,
    mana_cost: card.mana_cost,
    max_health: card.max_health,
    attack: card.attack,
    movement_speed: card.movement_speed,
    attack_range: card.attack_range,
    vision_range: card.vision_range,
    attack_speed: card.attack_speed,
    hitbox_size: card.hitbox_size,
    summon_time: card.summon_time,
    projectile_speed: card.projectile_speed,
    civilization: card.civilization?.name ?? null, // 문명 이름 포함
  };
}


  // 카드 업그레이드
  async upgradeCard(userId: string, cardId: number): Promise<UpgradeCardResponseDto> {
  const userCard = await this.userCardRepo.findOne({
    where: { user: { id: userId }, card: { id: cardId } },
    relations: ['card'],
  });

  if (!userCard) throw new NotFoundException('해당 카드를 보유하고 있지 않습니다.');
  if (userCard.quantity < 5) throw new BadRequestException('카드 업그레이드 조건을 충족하지 않습니다.');

  userCard.level += 1;
  userCard.quantity -= 5;

  const saved = await this.userCardRepo.save(userCard);

  return {
    id: saved.id,
    level: saved.level,
    quantity: saved.quantity,
    upgradeable: saved.quantity >= 5,
    card: {
      id: saved.card.id,
      name: saved.card.name,
      type: saved.card.type,
    },
  };
}

  // 카드 획득
  async acquireCard(acquireCardDto: AcquireCardDto): Promise<UserCard> {
    const { userId, cardId, quantity } = acquireCardDto;
    const addQuantity = quantity || 1;

    // 사용자가 존재하는지 확인
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 카드가 존재하는지 확인
    const card = await this.cardRepo.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('카드를 찾을 수 없습니다.');
    }

    // 이미 획득한 카드인지 확인
    let userCard = await this.userCardRepo.findOne({ where: { user: { id: userId }, card: { id: cardId } } });

    if (userCard) {
      // 이미 가지고 있는 카드라면 수량만 증가시키기
      userCard.quantity += addQuantity;
    } else {
      // 새로운 카드 획득
      userCard = this.userCardRepo.create({
        user,
        card,
        level: 1,  // 기본적으로 레벨 1로 설정
        quantity: addQuantity,
        upgradeable: false,
      });
    }

    // 유저 카드 저장
    await this.userCardRepo.save(userCard);

    // 카드 획득 후 보상 로직을 여기에 추가 가능 (예: XP 증가 등)

    return userCard;  // 획득한 카드 반환
  }
}
