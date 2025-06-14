import { ApiProperty } from '@nestjs/swagger';

export class CancelMatchDto {
  @ApiProperty({ example: 'user-abc-123', description: '유저 고유 ID' })
  player: string;
}