import {
  Controller,
  Post,
  Param,
  Body,
  ParseBoolPipe,
} from '@nestjs/common';
import { BattlePassService } from './battle-pass.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

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
  @ApiBody({ schema: { example: { premium: true } } })
  @ApiResponse({ status: 200, description: '프리미엄 상태가 업데이트됨' })
  setPremium(
    @Param('userId') userId: string,
    @Body('premium', ParseBoolPipe) premium: boolean,
  ) {
    return this.battlePassService.setPremium(userId, premium);
  }

  @Post(':userId/claim-reward/:missionId')
  @ApiOperation({ summary: '미션 보상 수령' })
  @ApiParam({ name: 'userId', type: String })
  @ApiParam({ name: 'missionId', type: Number })
  @ApiResponse({ status: 200, description: '보상 수령 완료 및 유저 자원 갱신' })
  claimReward(
    @Param('userId') userId: string,
    @Param('missionId') missionId: number,
  ) {
    return this.battlePassService.completeMission(userId, missionId);
  }
}
