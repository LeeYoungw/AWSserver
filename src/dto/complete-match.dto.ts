import { ApiProperty } from '@nestjs/swagger';

export class CompleteMatchDto {
  @ApiProperty({ example: 'user-abc-123' })
  player1: string;

  @ApiProperty({ example: 'user-def-456' })
  player2: string;

  @ApiProperty({ example: 'room-xyz-789' })
  roomId: string;
}