import { Controller, Get, Param } from '@nestjs/common';
import { LobbyService } from './lobby.service'; 
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Lobby') 
@Controller('users')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {} 

  @ApiOperation({ summary: '사용자 프로필 조회' })
  @ApiResponse({ status: 200, description: '사용자 정보 반환' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @Get(':id/profile')
  async getUserProfile(@Param('id') uid: string) {
    return this.lobbyService.getUserProfile(uid); 
  }
}
