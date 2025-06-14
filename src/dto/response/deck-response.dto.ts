import { ApiProperty } from '@nestjs/swagger';
import { CardResponseDto } from './card-response.dto';

export class DeckResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '내 덱1' })
  name: string;

  @ApiProperty({ type: [CardResponseDto] })
  cards: CardResponseDto[];
}
