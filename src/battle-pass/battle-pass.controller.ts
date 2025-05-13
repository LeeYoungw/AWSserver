import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { BattlePassService } from './battle-pass.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { SetPremiumDto } from 'src/dto/battle-pass.dto';

@ApiTags('Battle Pass')
@Controller('battle-pass')
export class BattlePassController {
  constructor(private readonly battlePassService: BattlePassService) {}

  @Post(':userId/increase-xp')
  @ApiOperation({ summary: 'XP 증가 (전투 1회 참여 시)' })
  @ApiParam({ name: 'userId', type: String, description: '유저 ID' })
  @ApiResponse({ status: 200, description: 'XP 증가 및 필요 시 레벨업 처리됨' })
  increaseXp(@Param('userId') userId: string) {
    return this.battlePassService.incrementXp(userId);
  }

  @Post(':userId/set-premium')
  @ApiOperation({ summary: '프리미엄 여부 설정' })
  @ApiParam({ name: 'userId', type: String })
  @ApiBody({ type: SetPremiumDto })
  @ApiResponse({ status: 200, description: '프리미엄 상태가 업데이트됨' })
  setPremium(@Param('userId') userId: string, @Body() setPremiumDto: SetPremiumDto) {
    return this.battlePassService.setPremium(userId, setPremiumDto.premium);
  }

  @Post(':userId/claim-reward/:missionId')
  @ApiOperation({ summary: '미션 보상 수령' })
  @ApiParam({ name: 'userId', type: String })
  @ApiParam({ name: 'missionId', type: Number })
  @ApiResponse({ status: 200, description: '보상 수령 완료 및 유저 자원 갱신' })
  claimReward(@Param('userId') userId: string, @Param('missionId') missionId: number) {
    return this.battlePassService.completeMission(userId, missionId);
  }

  // 시즌별 보상 조회 API
  @Get('rewards/:season')
  @ApiOperation({ summary: '시즌별 배틀패스 보상 조회' })
  @ApiParam({ name: 'season', type: Number, description: '시즌 번호' })
  @ApiResponse({ status: 200, description: '시즌별 보상 목록 반환' })
  getRewardsBySeason(@Param('season') season: number) {
    return this.battlePassService.getRewardsBySeason(season);
  }
}
