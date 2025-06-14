import { ApiProperty } from '@nestjs/swagger';
import { DeckSlotResponseDto } from './DeckSlot-response.dto';

export class UserDeckResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '내 덱1' })
  name: string;

  @ApiProperty({ example: true })
  is_selected: boolean;

  @ApiProperty({ type: [DeckSlotResponseDto], description: '덱에 포함된 슬롯 카드 정보' })
  slots: DeckSlotResponseDto[];
}
