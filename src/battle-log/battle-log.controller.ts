import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { BattleLogService } from './battle-log.service';
import { CreateBattleLogDto } from '../dto/battle-log.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('BattleLog')  // Swagger 그룹명 추가하면 보기 좋아짐
@Controller('battle-log')
export class BattleLogController {
  constructor(private readonly battleLogService: BattleLogService) {}

  @ApiOperation({ summary: '배틀 로그 저장' })
  @ApiResponse({ status: 200, description: '배틀 로그 저장 완료' })
  @ApiBody({ type: CreateBattleLogDto }) // ✅ Swagger에서 Body 작성 가능
  @Post('create')
  async createBattleLog(@Body() createBattleLogDto: CreateBattleLogDto) {
    return this.battleLogService.createBattleLog(createBattleLogDto);
  }

  @ApiOperation({ summary: '특정 두 유저의 배틀 로그 조회' })
  @ApiResponse({ status: 200, description: '배틀 로그 반환' })
  @ApiResponse({ status: 404, description: '해당 유저 또는 로그 없음' })
  @Get(':player1_id/:player2_id')
  async getBattleLogs(
    @Param('player1_id') player1Id: string,
    @Param('player2_id') player2Id: string,
  ) {
    return this.battleLogService.getBattleLogs(player1Id, player2Id);
  }
}
