import { ApiProperty } from '@nestjs/swagger';

export class DeckSlotResponseDto {
  @ApiProperty({ example: 0, description: '슬롯 번호' })
  slot: number;

  @ApiProperty({ example: 1, description: '카드 ID' })
  cardId: number | null;
}
