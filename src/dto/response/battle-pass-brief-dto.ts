import { ApiProperty } from '@nestjs/swagger';

export class BattlePassBriefDto {
  @ApiProperty({ example: 1 })
  level: number;

  @ApiProperty({ example: 6 })
  xp: number;

  @ApiProperty({ example: true })
  is_premium: boolean;
}
