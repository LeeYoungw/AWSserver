// match.controller.ts
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { MatchService } from './match.service';
import { StartMatchDto } from '../dto/start-match.dto';
import { CancelMatchDto } from '../dto/cancel-match.dto';
import { CompleteMatchDto } from '../dto/complete-match.dto';

@ApiTags('Match')
@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post('start')
  @ApiOperation({ summary: '매칭 요청' })
  @ApiBody({ type: StartMatchDto })
  @ApiResponse({ status: 201, description: '매칭 요청 완료' })
  startMatch(@Body() dto: StartMatchDto) {
    return this.matchService.startMatch(dto);
  }

  @Get('status')
  @ApiOperation({ summary: '매칭 상태 확인' })
  @ApiQuery({ name: 'player', required: true })
  @ApiResponse({ status: 200, description: '현재 매칭 상태 반환' })
  getStatus(@Query('player') playerId: string) {
    return this.matchService.getStatus(playerId);
  }

  @Post('cancel')
  @ApiOperation({ summary: '매칭 취소' })
  @ApiBody({ type: CancelMatchDto })
  @ApiResponse({ status: 200, description: '매칭 취소됨' })
  cancelMatch(@Body() dto: CancelMatchDto) {
    return this.matchService.cancelMatch(dto);
  }

  @Post('complete')
  @ApiOperation({ summary: '매칭 완료 통보 (매칭 서버 → 로비)' })
  @ApiBody({ type: CompleteMatchDto })
  @ApiResponse({ status: 200, description: '매칭 완료 처리됨' })
  completeMatch(@Body() dto: CompleteMatchDto) {
    return this.matchService.completeMatch(dto);
  }
}
