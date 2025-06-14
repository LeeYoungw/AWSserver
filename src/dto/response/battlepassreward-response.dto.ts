import { ApiProperty } from '@nestjs/swagger';
import { BattlePassMissionSummaryDto } from '../battlepassmission.dto';


export class RewardItemDto {
  reward_type: string;
  amount: number;
  is_premium: boolean;
  reward_id: number;
}

export class GroupedMissionRewardDto {
  level: number;
  mission_description: string;
  is_completed: boolean;
  rewards: RewardItemDto[];
}