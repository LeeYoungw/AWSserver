import { Controller, Get, Param } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserProfileResponseDto } from 'src/dto/response/user-profile-response.dto';
@ApiTags('Lobby')
@Controller('users')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @ApiOperation({ summary: '사용자 프로필 조회' })
@ApiParam({
  name: 'id',
  type: String,
  description: '유저 ID (UUID)',
  example: 'abc123e4-5678-90ab-cdef-1234567890gh',
})
@ApiResponse({
  status: 200,
  description: '사용자 정보 반환',
  type: UserProfileResponseDto,
})
@ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
@Get(':id/profile')
async getUserProfile(@Param('id') uid: string) {
  return this.lobbyService.getUserProfile(uid);
}}
