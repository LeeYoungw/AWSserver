import { Controller, Get, Post, Param } from '@nestjs/common';
import { DailyMissionService } from './dailymission.service';
import { UserDailyMissionDto } from 'src/dto/response/DailyMission-response.dto';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Daily Mission')
@Controller('daily-mission')
export class DailyMissionController {
  constructor(private readonly missionService: DailyMissionService) {}

  @Get(':userId')
@ApiOperation({ summary: '유저 일일 미션 목록 조회' })
@ApiParam({ name: 'userId', type: String, example: 'abc123-uuid', description: '유저 ID' })
@ApiResponse({
  status: 200,
  description: '유저의 일일 미션 목록 반환',
  type: UserDailyMissionDto,
  isArray: true,
})

getMissions(@Param('userId') userId: string) {
  return this.missionService.getUserDailyMissions(userId);
}

  @Post('complete/:userId/:missionId')
  @ApiOperation({ summary: '일일 미션 완료 처리' })
  @ApiParam({ name: 'userId', type: String, example: 'abc123-uuid', description: '유저 ID' })
  @ApiParam({ name: 'missionId', type: Number, example: 1, description: '미션 ID' })
  @ApiResponse({ status: 200, description: '미션 완료 처리 결과' })
  completeMission(
    @Param('userId') userId: string,
    @Param('missionId') missionId: number,
  ) {
    return this.missionService.completeMission(userId, missionId);
  }

  @Post('claim/:userId/:missionId')
  @ApiOperation({ summary: '일일 미션 보상 수령' })
  @ApiParam({ name: 'userId', type: String, example: 'abc123-uuid', description: '유저 ID' })
  @ApiParam({ name: 'missionId', type: Number, example: 1, description: '미션 ID' })
  @ApiResponse({ status: 200, description: '보상 지급 결과 반환' })
  claimReward(
    @Param('userId') userId: string,
    @Param('missionId') missionId: number,
  ) {
    return this.missionService.claimReward(userId, missionId);
  }
}
