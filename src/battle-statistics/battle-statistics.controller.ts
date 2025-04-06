import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { BattleStatisticsService } from './battle-statistics.service';

@ApiTags('Battle Statistics')
@Controller('users')
export class BattleStatisticsController {
  constructor(private readonly statisticsService: BattleStatisticsService) {}

  @Get(':userId/statistics')
  @ApiOperation({
    summary: '유저 전투 통계 조회',
    description: `
    - 총 승리 수
    - 현재 트로피
    - 현재 사용 중인 덱 (1번 덱 기준) 정보
    - 평균 마나 코스트
    - 자주 사용하는 카드
    - 카드 보유 수
    - 사용 문명
    - 가장 많이 사용한 카드 ID
    `,
  })
  @ApiParam({ name: 'userId', description: '유저 ID' })
  @ApiResponse({
    status: 200,
    description: '유저 전투 통계 반환',
    schema: {
      example: {
        totalWins: 15,
        trophies: 1280,
        averageManaCost: 3.6,
        deckName: '1번덱',
        mostUsedCardId: 4,
        ownedCardCount: 21,
        civilization: '로마',
      },
    },
  })
  async getUserStatistics(@Param('userId') userId: string) {
    return this.statisticsService.getUserStatistics(userId);
  }
}
