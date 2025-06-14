import { ApiProperty } from '@nestjs/swagger';
import { DailyMissionType } from 'src/entities/enum';

export class DailyMissionDefinitionDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '출석 보상' })
  title: string;

  @ApiProperty({ example: 'gold' })
  reward_type: string;

  @ApiProperty({ example: 50 })
  reward_amount: number;

  @ApiProperty({ enum: DailyMissionType, example: 'ATTENDANCE' })
  mission_type: DailyMissionType;

  @ApiProperty({ example: false })
  is_streak_based: boolean;
}

export class UserDailyMissionDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: true })
  is_completed: boolean;

  @ApiProperty({ example: true })
  is_claimed: boolean;

  @ApiProperty({ example: '2025-05-12' })
  date: string;

  @ApiProperty({ type: DailyMissionDefinitionDto })
  mission: DailyMissionDefinitionDto;
}





