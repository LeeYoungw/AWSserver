import { ApiProperty } from '@nestjs/swagger';

export class BattlePassMissionSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  level: number;

  @ApiProperty({ example: '레벨 1 미션' })
  description: string;

  @ApiProperty({ example: 1, description: '0 = 미완료, 1 = 완료' })
  is_completed: number;
}
