import { ApiProperty } from '@nestjs/swagger';

export class CreateBattleLogDto {
  @ApiProperty({ example: 'user1-id', description: '플레이어 1의 ID' })
  player1_id: string;

  @ApiProperty({ example: 'user2-id', description: '플레이어 2의 ID' })
  player2_id: string;

  @ApiProperty({ example: 'user1-id', description: '승자의 ID' })
  winner_id: string;

  @ApiProperty({ example: 30, description: '트로피 변화량' })
  trophies_change: number;

  @ApiProperty({ example: 2, description: '카드 보상 개수 변화량' })
  card_change: number;

  @ApiProperty({ example: 500, description: '골드 변화량' })
  gold_change: number;
  @ApiProperty({ example: 1, description: '플레이어 1이 사용한 덱 ID', required: false })
usedDeck1_id?: number;

@ApiProperty({ example: 2, description: '플레이어 2가 사용한 덱 ID', required: false })
usedDeck2_id?: number;
}
