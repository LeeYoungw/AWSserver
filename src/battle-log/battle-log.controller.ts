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

@ApiTags('BattleLog') // Swagger 그룹명
@Controller('battle-log')
export class BattleLogController {
  constructor(private readonly battleLogService: BattleLogService) {}

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

  @Get('user/:userId')
  @ApiOperation({ summary: '단일 유저 기준 배틀 로그 (페이지네이션)' })
  @ApiParam({ name: 'userId', description: '유저 ID' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '해당 유저의 배틀 로그 리스트' })
  async getBattleLogsByUser(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.battleLogService.getBattleLogsByUser(userId, +page, +limit);
  }
}

