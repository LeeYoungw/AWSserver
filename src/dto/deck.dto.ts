import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeckDto {
  @ApiProperty({ example: 'user-uuid', description: '유저 ID' })
  userId: string;

  @ApiPropertyOptional({ example: '내 덱1', description: '덱 이름 (선택)' })
  name?: string;
}

export class UpdateDeckSlotDto {
  @ApiProperty({ example: 'user-uuid', description: '유저 ID' })
  userId: string;

  @ApiProperty({ example: 1, description: '덱 ID' })
  deckId: number;

  @ApiProperty({ example: 101, description: '카드 ID' })
  cardId: number;

  @ApiProperty({ example: 0, description: '슬롯 위치 (0~n)' })
  slot: number;
}
