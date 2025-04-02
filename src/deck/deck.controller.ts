import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
} from '@nestjs/common';
import { DeckService } from './deck.service';
import { CreateDeckDto, UpdateDeckSlotDto } from '../dto/deck.dto';
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
  @ApiResponse({ status: 200, description: '유저 덱 배열 반환' })
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

  @ApiOperation({ summary: '덱 삭제' })
  @ApiParam({ name: 'deckId', type: Number, description: '삭제할 덱 ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          example: 'user-uuid',
          description: '유저 ID',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '삭제 성공 메시지 또는 결과' })
  @Delete(':deckId')
  deleteDeck(
    @Param('deckId') deckId: number,
    @Body('userId') userId: string,
  ) {
    return this.deckService.deleteDeck(deckId, userId);
  }
}
