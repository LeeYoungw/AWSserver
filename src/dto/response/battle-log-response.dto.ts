import { ApiProperty } from '@nestjs/swagger';
import { DeckResponseDto } from './deck-response.dto';

export class BattleLogItemDto {
  @ApiProperty({ example: 15 })
  id: number;

  @ApiProperty({ example: 'win' })
outcome: 'win' | 'loss' | 'draw';


  @ApiProperty({ example: 30 })
  trophies_change: number;

  @ApiProperty({ example: 2 })
  card_change: number;

  @ApiProperty({ example: 500 })
  gold_change: number;

  @ApiProperty({ example: '2025-04-15T06:44:16.000Z' })
  battle_record_time: string;

  @ApiProperty({ type: DeckResponseDto })
my_deck: DeckResponseDto;

@ApiProperty({ type: DeckResponseDto })
opponent_deck: DeckResponseDto;

}
