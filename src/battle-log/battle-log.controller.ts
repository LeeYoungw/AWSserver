import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { BattleLogService } from './battle-log.service';
import { CreateBattleLogDto } from '../dto/battle-log.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('BattleLog')
@Controller('battle-log')
export class BattleLogController {
  constructor(private readonly battleLogService: BattleLogService) {}
  
  @Get('oneuser')
  @ApiOperation({ summary: '단일 유저 기준 배틀 로그 (페이지네이션)' })
  @ApiQuery({ name: 'userId', description: '유저 ID', required: true })
  @ApiQuery({ name: 'page', description: '페이지 번호', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '페이지당 개수', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '해당 유저의 배틀 로그 리스트' })
  async getBattleLogsByUser(
    @Query('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (!userId) throw new Error('userId 쿼리 파라미터는 필수입니다.');
    return this.battleLogService.getBattleLogsByUser(userId, page, limit);
  }

  @Post('create')
  @ApiOperation({ summary: '배틀 로그 저장' })
  @ApiResponse({ status: 201, description: '배틀 로그 저장 성공' })
  @ApiBody({ type: CreateBattleLogDto })
  async createBattleLog(@Body() createBattleLogDto: CreateBattleLogDto) {
    return this.battleLogService.createBattleLog(createBattleLogDto);
  }

  @Get(':player1_id/:player2_id')
  @ApiOperation({ summary: '두 유저 간의 배틀 로그 조회' })
  @ApiParam({ name: 'player1_id', description: '플레이어 1 ID' })
  @ApiParam({ name: 'player2_id', description: '플레이어 2 ID' })
  @ApiResponse({ status: 200, description: '배틀 로그 리스트 반환' })
  async getBattleLogs(
    @Param('player1_id') player1Id: string,
    @Param('player2_id') player2Id: string,
  ) {
    return this.battleLogService.getBattleLogs(player1Id, player2Id);
  }

  
}
