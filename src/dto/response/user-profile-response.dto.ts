import { ApiProperty } from '@nestjs/swagger';
import { BattlePassBriefDto } from './battle-pass-brief-dto';

export class UserProfileResponseDto {
  @ApiProperty({ example: '67a7e7e6-91fe-41c7-ba55-a3dd948f7771' })
  id: string;

  @ApiProperty({ example: 'test@example.com' })
  email: string;

  @ApiProperty({ example: 1 })
  level: number;

  @ApiProperty({example : 'jongmin'})
  nickname: string;

  @ApiProperty({ example: 0 })
  exp: number;

  @ApiProperty({ example: 0 })
  trophies: number;

  @ApiProperty({ example: 29 })
  gold: number;

  @ApiProperty({ example: 50 })
  diamond: number;

  @ApiProperty({ example: null, nullable: true })
  last_login: Date | null;

  @ApiProperty({ example: 0 })
  streak: number;

  @ApiProperty({ example: 0 })
  total_attendance: number;

  @ApiProperty({ type: BattlePassBriefDto })
  battle_pass: BattlePassBriefDto;
}
