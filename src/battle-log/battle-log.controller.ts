import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { BattleLogService } from './battle-log.service';
import { CreateBattleLogDto } from '../dto/battle-log.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@Controller('battle-log')
export class BattleLogController {
  constructor(private readonly battleLogService: BattleLogService) {}

  @ApiBody({type: CreateBattleLogDto})
  @ApiOperation({ summary: '배틀 로그 저장' })
  @ApiResponse({ status: 200, description: '사용자 정보 반환' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @Post('create')
  async createBattleLog(@Body() createBattleLogDto: CreateBattleLogDto) {
    return this.battleLogService.createBattleLog(createBattleLogDto);
  }


  @ApiOperation({ summary: '특정 두 유저의 배틀 로그 조회' })
  @ApiResponse({ status: 200, description: '사용자 정보 반환' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @Get(':player1_id/:player2_id')
  async getBattleLogs(@Param('player1_id') player1Id: string, @Param('player2_id') player2Id: string) {
    return this.battleLogService.getBattleLogs(player1Id, player2Id);
  }
}
