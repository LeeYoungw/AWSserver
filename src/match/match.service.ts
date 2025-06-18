// match.service.ts
import { Injectable,NotFoundException,BadRequestException } from '@nestjs/common';
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

  // 이미 match_status에 등록된 플레이어인지 확인
  const existingStatus = await this.matchRepo.findOne({ where: { playerId: player } });

  if (existingStatus?.status === 'waiting') {
    return { message: '이미 매칭 대기 중입니다.' };
  }

  // 선택된 덱 조회
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

  // 덱 내 카드 및 레벨 정보 구성
  const cardList = selectedDeck.slots.map((slot) => slot.card);

  const userCards = await this.userCardRepository.find({
    where: {
      user: { id: player },
      card: In(cardList.map((card) => card.id)),
    },
    relations: ['card'],
  });

  const cardLevelMap = new Map(userCards.map((uc) => [uc.card.id, uc.level]));

  const deckPayload = cardList.map((card) => ({
    uid: card.cardCode, // card.id → card.card_code로 변경
    lv: cardLevelMap.get(card.id) ?? 1,
  }));

  // match_status 테이블에 삽입 또는 갱신
  await this.matchRepo.save({
    playerId: player,
    status: 'waiting',
    deckJson: deckPayload,
    requestedAt: new Date(),
  });

  // 매칭 서버로 전송
  try {
    await axios.post('http://whdals00401.iptime.org:5000/match/request', {
      userId: player,
      deck: deckPayload,
    });
  } catch (error) {
    // 409 Conflict일 경우 무시하고 정상처리
    if (error.response?.status === 409 && error.response?.data === 'Enqueued') {
      console.warn(`매칭 서버: 이미 큐에 등록됨 (userId: ${player})`);
    } else {
      // 다른 에러는 다시 throw
      throw new Error(`매칭 서버 요청 실패: ${error.message}`);
    }
  }

  return { message: '매칭 요청 완료' };
}

  async getStatus(playerId: string) {
  const status = await this.matchRepo.findOne({ where: { playerId } });

  if (!status) return { status: 'none' };

  if (status.status === 'ready') {
    // 선택된 덱 조회
    const selectedDeck = await this.userDeckRepository.findOne({
      where: {
        user: { id: playerId },
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
        user: { id: playerId },
        card: In(cardList.map((card) => card.id)),
      },
      relations: ['card'],
    });

    const cardLevelMap = new Map(userCards.map((uc) => [uc.card.id, uc.level]));

    const deckPayload = cardList.map((card) => ({
      uid: card.cardCode,
      lv: cardLevelMap.get(card.id) ?? 1,
    }));

    return {
      status: status.status,
      roomId: status.roomId,
      deck: deckPayload,
    };
  }
}


  async cancelMatch(dto: CancelMatchDto) {
    await this.matchRepo.delete({ playerId: dto.player });
    try {
    await axios.post('http://whdals00401.iptime.org:5000/match/cancel', {
      userId: dto.player,
    });
  } catch (error) {
    // 404나 기타 실패 시 로그만 찍고 무시
    console.warn(`매칭 서버 큐 삭제 실패 (userId: ${dto.player}): ${error.message}`);
  }

  return { message: '매칭 취소됨' };
  }

 async completeMatch(dto: CompleteMatchDto) {
  const { player1, player2, roomId } = dto;

  if (!player1 || !player2 || !roomId) {
    throw new BadRequestException('요청 값이 누락됨');
  }

  await this.matchRepo.update({ playerId: player1 }, {
    status: 'ready',
    opponentId: player2,
    roomId,
  });

  await this.matchRepo.update({ playerId: player2 }, {
    status: 'ready',
    opponentId: player1,
    roomId,
  });

  return { message: '매칭 완료 처리됨' };
}

}
