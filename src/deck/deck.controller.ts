import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { DeckService } from './deck.service';
import { CreateDeckDto, UpdateDeckSlotDto } from '../dto/deck.dto';
import { UserDeckResponseDto } from 'src/dto/response/Userdeck-response.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Deck')
@Controller('deck')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @ApiOperation({ summary: '유저의 덱 전체 조회' })
@ApiParam({ name: 'userId', type: String, description: '유저 ID' })
@ApiResponse({
  status: 200,
  description: '유저 덱 배열 반환',
  type: UserDeckResponseDto,
  isArray: true,
})
@Get(':userId')
getUserDecks(@Param('userId') userId: string) {
  return this.deckService.getUserDecks(userId);
}
  @ApiOperation({ summary: '덱 생성' })
  @ApiBody({ type: CreateDeckDto })
  @ApiResponse({ status: 201, description: '생성된 덱 반환' })
  @Post()
  createDeck(@Body() createDeckDto: CreateDeckDto) {
    return this.deckService.createDeck(createDeckDto);
  }

  @ApiOperation({ summary: '덱 슬롯 업데이트 (카드 추가/수정)' })
  @ApiBody({ type: UpdateDeckSlotDto })
  @ApiResponse({ status: 200, description: '업데이트된 슬롯 반환' })
  @Post('slot')
  updateDeckSlot(@Body() updateDeckSlotDto: UpdateDeckSlotDto) {
    return this.deckService.updateDeckSlot(updateDeckSlotDto);
  }

@Delete('by-name')
@HttpCode(200)
@ApiOperation({ summary: '덱 삭제 (덱 이름 기준)' })
@ApiResponse({ status: 200, description: '삭제 성공 메시지 또는 결과' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      userId: { type: 'string', example: 'uuid' },
      deckName: { type: 'string', example: 'My Deck' },
    },
  },
})
deleteDeck(@Body() body: { userId: string; deckName: string }) {
  return this.deckService.deleteDeckByName(body.userId, body.deckName);
}

  @ApiOperation({ summary: '덱 선택 및 슬롯/이름 교환 처리' })
  @ApiParam({ name: 'userId', type: String, description: '유저 ID' })
  @ApiParam({ name: 'deckId', type: Number, description: '선택할 덱 ID' })
  @ApiResponse({ status: 200, description: '덱 선택 완료 메시지' })
  @Post('select/:userId/:deckId')
  selectDeck(
    @Param('userId') userId: string,
    @Param('deckId') deckId: number,
  ) {
    return this.deckService.selectDeck(userId, deckId);
  }  
}
