// match.service.ts
import { Injectable,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,In } from 'typeorm';
import { MatchStatus } from 'src/entities/match_status.entity';
import { StartMatchDto } from '../dto/start-match.dto';
import { CancelMatchDto } from '../dto/cancel-match.dto';
import { CompleteMatchDto } from '../dto/complete-match.dto';
import { UserDeck } from '../entities/user-deck.entity'; 
import axios from 'axios';
import { UserCard } from 'src/entities/user-card.entity';
@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(MatchStatus)
    private readonly matchRepo: Repository<MatchStatus>,

    @InjectRepository(UserDeck)
    private readonly userDeckRepository: Repository<UserDeck>,

     @InjectRepository(UserCard)
    private readonly userCardRepository: Repository<UserCard>,
    
  ) {}
 // 매칭 요청 클라이언트에서 요청
  async startMatch(dto: StartMatchDto) {
    const { player } = dto;

    const selectedDeck = await this.userDeckRepository.findOne({
      where: {
        user: { id: player },
        is_selected: true,
      },
      relations: ['slots', 'slots.card'],
    });

    if (!selectedDeck) {
      throw new NotFoundException('선택된 덱이 없습니다.');
    }

    const cardList = selectedDeck.slots.map((slot) => slot.card);

    const userCards = await this.userCardRepository.find({
      where: {
        user: { id: player },
        card: In(cardList.map((card) => card.id)),
      },
      relations: ['card'],
    });

    const cardLevelMap = new Map(
      userCards.map((uc) => [uc.card.id, uc.level])
    );

    const deckPayload = cardList.map((card) => ({
      uid: card.name, // uid 필드가 있다면 card.uid
      lv: cardLevelMap.get(card.id) ?? 1,
    }));

    await this.matchRepo.save({
      playerId: player,
      status: 'waiting',
      deckJson: deckPayload,
      requestedAt: new Date(),
    });

    await axios.post('http://whdals00401.iptime.org:5000/match/request', {
      userId: player,
      deck: deckPayload,
    });

    return { message: '매칭 요청 완료' };
  }


  async getStatus(playerId: string) {
    const status = await this.matchRepo.findOne({ where: { playerId } });
    if (!status) return { status: 'none' };

    return {
      status: status.status,
      roomId: status.roomId,
    };
  }

  async cancelMatch(dto: CancelMatchDto) {
    await this.matchRepo.delete({ playerId: dto.player });
    return { message: '매칭 취소됨' };
  }

  async completeMatch(dto: CompleteMatchDto) {
    const { player1, player2, roomId } = dto;

    await this.matchRepo.update(player1, {
      status: 'ready',
      opponentId: player2,
      roomId,
    });

    await this.matchRepo.update(player2, {
      status: 'ready',
      opponentId: player1,
      roomId,
    });

    return { message: '매칭 완료 처리됨' };
  }
}
