import {
    Controller,
    Get,
    Param,
    Query,
    Post,
  } from '@nestjs/common';
  import { CardService } from './card.service';
  import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
  } from '@nestjs/swagger';
  
  @ApiTags('Card')
  @Controller('card')
  export class CardController {
    constructor(private readonly cardService: CardService) {}
  
    @ApiOperation({ summary: '유저 보유 카드 조회' })
    @ApiParam({ name: 'userId', type: String, description: '유저 ID' })
    @ApiQuery({ name: 'type', required: false, description: '카드 타입 (문명, 유닛, 건물, 마법)' })
    @ApiResponse({ status: 200, description: '보유 카드 목록 반환' })
    @Get('user/:userId')
    getUserCards(
      @Param('userId') userId: string,
      @Query('type') type?: string,
    ) {
      return this.cardService.getUserCards(userId, type);
    }
  
    @ApiOperation({ summary: '카드 상세 정보 확인' })
    @ApiParam({ name: 'cardId', type: Number, description: '카드 ID' })
    @ApiResponse({ status: 200, description: '카드 상세 정보 반환' })
    @Get('detail/:cardId')
    getCardDetail(@Param('cardId') cardId: number) {
      return this.cardService.getCardDetail(cardId);
    }
  
    @ApiOperation({ summary: '카드 업그레이드' })
    @ApiParam({ name: 'userId', type: String, description: '유저 ID' })
    @ApiParam({ name: 'cardId', type: Number, description: '카드 ID' })
    @ApiResponse({ status: 200, description: '업그레이드된 카드 반환' })
    @Post('upgrade/:userId/:cardId')
    upgradeCard(
      @Param('userId') userId: string,
      @Param('cardId') cardId: number,
    ) {
      return this.cardService.upgradeCard(userId, cardId);
    }
  }
  