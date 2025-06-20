import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,  // Importing Body decorator
} from '@nestjs/common';
import { CardService } from './card.service';
import {
  ApiBody,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AcquireCardDto } from '../dto/AcquireCard.dto';
import { UserCard } from '../entities/user-card.entity';
import { UserCardResponseDto,UpgradeCardResponseDto} from 'src/dto/response/UserCard-response.dto';
import {CardDetailResponseDto  } from 'src/dto/response/card-detail-response.dto';

@ApiTags('Card')
@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @ApiOperation({ summary: '유저 보유 카드 조회' })
@ApiParam({ name: 'userId', type: String, description: '유저 ID' })
@ApiQuery({ name: 'type', required: false, description: '카드 타입 (문명, unit, building, spell)' })
@ApiResponse({
  status: 200,
  description: '보유 카드 목록 반환',
  type: UserCardResponseDto,
  isArray: true,
})
@Get('user/:userId')
getUserCards(
  @Param('userId') userId: string,
  @Query('type') type?: string,
) {
  return this.cardService.getUserCards(userId, type);
}

  @ApiOperation({ summary: '카드 획득' })
  @ApiResponse({ status: 201, description: '카드 획득 성공', type: UserCard })
  @ApiResponse({ status: 404, description: '사용자 또는 카드가 존재하지 않음' })
  @ApiBody({ type: AcquireCardDto })
  @Post('acquire')
  async acquireCard(@Body() acquireCardDto: AcquireCardDto): Promise<UserCard> {
    // Body로부터 userId, cardId를 받아 CardService의 acquireCard 메서드 호출
    return this.cardService.acquireCard(acquireCardDto);
  }

  

@ApiOperation({ summary: '카드 상세 정보 확인' })
@ApiParam({ name: 'cardId', type: Number, description: '카드 ID' })
@ApiResponse({
  status: 200,
  description: '카드 상세 정보 반환',
  type: CardDetailResponseDto,
})
@Get('detail/:cardId')
getCardDetail(@Param('cardId') cardId: number) {
  return this.cardService.getCardDetail(cardId);
}


@ApiOperation({ summary: '카드 업그레이드' })
@ApiParam({ name: 'userId', type: String, description: '유저 ID' })
@ApiParam({ name: 'cardId', type: Number, description: '카드 ID' })
@ApiResponse({
  status: 200,
  description: '업그레이드된 카드 반환',
  type: UpgradeCardResponseDto,
})
@Post('upgrade/:userId/:cardId')
upgradeCard(
  @Param('userId') userId: string,
  @Param('cardId') cardId: number,
) {
  return this.cardService.upgradeCard(userId, cardId);
}
}
