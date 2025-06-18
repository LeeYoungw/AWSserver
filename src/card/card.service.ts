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
    cardcode: card.cardCode,
    mana_cost: card.manaCost,
    max_health: card.maxHealth,
    attack: card.attack,
    movement_speed: card.movementSpeed,
    attack_range: card.attackRange,
    vision_range: card.visionRange,
    attack_speed: card.attackSpeed,
    hitbox_size: card.hitboxSize,
    summon_time: card.summonTime,
    projectile_speed: card.projectileSpeed,
    civilization: card.civilization?.name ?? null,
  };
}



async upgradeCard(userId: string, cardId: number): Promise<UpgradeCardResponseDto> {
  const userCard = await this.userCardRepo.findOne({
    where: { user: { id: userId }, card: { id: cardId } },
    relations: ['card'],
  });

  if (!userCard) {
    throw new NotFoundException('해당 카드를 보유하고 있지 않습니다.');
  }

  const currentLevel = userCard.level;
  const MAX_LEVEL = 4;

  if (currentLevel >= MAX_LEVEL) {
    throw new BadRequestException(`최대 레벨(${MAX_LEVEL - 1})을 초과할 수 없습니다.`);
  }

  const requiredCards = this.getRequiredCardsForLevel(currentLevel);

  if (userCard.quantity < requiredCards) {
    throw new BadRequestException(`업그레이드에 필요한 카드 수 부족 (${requiredCards}개 필요)`);
  }

  // 유저 조회
  const user = await this.userRepo.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('사용자를 찾을 수 없습니다.');
  }

  // 수량 차감 및 레벨 증가
  userCard.quantity -= requiredCards;
  userCard.level += 1;

  // 업그레이드 가능 여부 갱신
  const nextRequired = this.getRequiredCardsForLevel(userCard.level);
  userCard.upgradeable = userCard.quantity >= nextRequired;

  // 카드 스탯 증가 (테스트용)
  const card = userCard.card;
  card.maxHealth = Math.floor(card.maxHealth * 1.1);
  card.attack = Math.floor(card.attack * 1.1);

  // 경험치 지급
  const EXP_GAIN_PER_UPGRADE = 100;
  user.exp += EXP_GAIN_PER_UPGRADE;

  // 저장
  await Promise.all([
    this.cardRepo.save(card),
    this.userCardRepo.save(userCard),
    this.userRepo.save(user),
  ]);

  return {
    id: userCard.id,
    level: userCard.level,
    quantity: userCard.quantity,
    upgradeable: userCard.upgradeable,
    card: {
      id: card.id,
      name: card.name,
      type: card.type,
    },
  };
}


private getRequiredCardsForLevel(level: number): number {
  switch (level) {
    case 1: return 3;
    case 2: return 15;
    case 3: return 75;
    default: return Infinity;
  }
}

async acquireCard(acquireCardDto: AcquireCardDto): Promise<UserCard> {
  const { userId, cardId, quantity } = acquireCardDto;
  const addQuantity = quantity || 1;

  // 사용자 존재 확인
  const user = await this.userRepo.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('사용자를 찾을 수 없습니다.');
  }

  // 카드 존재 확인
  const card = await this.cardRepo.findOne({ where: { id: cardId } });
  if (!card) {
    throw new NotFoundException('카드를 찾을 수 없습니다.');
  }

  // 유저 카드 확인
  let userCard = await this.userCardRepo.findOne({
    where: { user: { id: userId }, card: { id: cardId } },
  });

  if (userCard) {
    userCard.quantity += addQuantity;
  } else {
    userCard = this.userCardRepo.create({
      user,
      card,
      level: 1,
      quantity: addQuantity,
      upgradeable: false,
    });
  }

  // 업그레이드 가능 여부만 판단 (레벨업은 하지 않음)
  const required = this.getRequiredCardsForLevel(userCard.level);
  userCard.upgradeable = userCard.quantity >= required;

  await this.userCardRepo.save(userCard);

  return userCard;
}erCard;
}

