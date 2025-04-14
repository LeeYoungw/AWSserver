import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../entities/card.entity';
import { UserCard } from '../entities/user-card.entity';
import { User } from '../entities/user.entity';
import { AcquireCardDto } from '../dto/card.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,

    @InjectRepository(UserCard)
    private readonly userCardRepo: Repository<UserCard>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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

  // 카드 정보 조회
  async getCardDetail(cardId: number) {
    return this.cardRepo.findOne({ where: { id: cardId } });
  }

  // 카드 업그레이드
  async upgradeCard(userId: string, cardId: number) {
    const userCard = await this.userCardRepo.findOne({
      where: { user: { id: userId }, card: { id: cardId } },
      relations: ['card', 'user'],
    });

    if (!userCard) throw new NotFoundException('해당 카드를 보유하고 있지 않습니다.');

    // 업그레이드 조건: 최소 XP 5 이상
    if (userCard.quantity < 5) throw new BadRequestException('카드 업그레이드 조건을 충족하지 않습니다.');

    // 업그레이드 처리
    userCard.level += 1;
    userCard.quantity -= 5;  // 5 XP 소모
    return this.userCardRepo.save(userCard);
  }

  // 카드 획득
  async acquireCard(acquireCardDto: AcquireCardDto): Promise<UserCard> {
    const { userId, cardId } = acquireCardDto;

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
      userCard.quantity += 1;
    } else {
      // 새로운 카드 획득
      userCard = this.userCardRepo.create({
        user,
        card,
        level: 1,  // 기본적으로 레벨 1로 설정
        quantity: 1,
        upgradeable: false,
      });
    }

    // 유저 카드 저장
    await this.userCardRepo.save(userCard);

    // 카드 획득 후 보상 로직을 여기에 추가 가능 (예: XP 증가 등)

    return userCard;  // 획득한 카드 반환
  }
}
