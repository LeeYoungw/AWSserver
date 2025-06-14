import { ApiProperty } from '@nestjs/swagger';
import { BattleLogItemDto } from './battle-log-response.dto';

export class PaginatedBattleLogResponseDto {
  @ApiProperty({ example: 21 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ type: [BattleLogItemDto] })
  data: BattleLogItemDto[];
}
