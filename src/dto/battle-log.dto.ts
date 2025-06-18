import { ApiProperty } from '@nestjs/swagger';

export class CreateBattleLogDto {
  @ApiProperty({ example: 'user1-id', description: '승자의 ID' })
  winnerId: string;

  @ApiProperty({ example: false, description: '무승부 여부' })
  isDraw: boolean;
}
