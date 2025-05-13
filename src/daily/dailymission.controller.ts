import { Controller, Get, Post, Param } from '@nestjs/common';
import { DailyMissionService } from './dailymission.service';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Daily Mission')
@Controller('daily-mission')
export class DailyMissionController {
  constructor(private readonly missionService: DailyMissionService) {}

  @Get(':userId')
  @ApiOperation({ summary: '유저 일일 미션 목록 조회' })
  getMissions(@Param('userId') userId: string) {
    return this.missionService.getUserDailyMissions(userId);
  }

  @Post('complete/:userId/:missionId')
  @ApiOperation({ summary: '일일 미션 완료 처리' })
  completeMission(
    @Param('userId') userId: string,
    @Param('missionId') missionId: number,
  ) {
    return this.missionService.completeMission(userId, missionId);
  }

  @Post('claim/:userId/:missionId')
  @ApiOperation({ summary: '일일 미션 보상 수령' })
  claimReward(
    @Param('userId') userId: string,
    @Param('missionId') missionId: number,
  ) {
    return this.missionService.claimReward(userId, missionId);
  }
}
