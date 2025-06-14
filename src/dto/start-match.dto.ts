import { ApiProperty } from '@nestjs/swagger';

export class StartMatchDto {
  @ApiProperty({ example: 'user-abc-123', description: '유저 고유 ID' })
  player: string;
}