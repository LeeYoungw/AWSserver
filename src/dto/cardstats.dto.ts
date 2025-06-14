import { ApiProperty } from '@nestjs/swagger';

export class CardStatsDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Warrior' })
  name: string;

  @ApiProperty({ example: 'unit' })
  type: string;

  @ApiProperty({ example: 5 })
  mana_cost: number;

  @ApiProperty({ example: 100 })
  max_health: number;

  @ApiProperty({ example: 20 })
  attack: number;

  @ApiProperty({ example: 3 })
  movement_speed: number;

  @ApiProperty({ example: 1.5 })
  attack_range: number;

  @ApiProperty({ example: 10 })
  vision_range: number;

  @ApiProperty({ example: 1.2 })
  attack_speed: number;

  @ApiProperty({ example: 1 })
  hitbox_size: number;

  @ApiProperty({ example: 1 })
  summon_time: number;

  @ApiProperty({ example: 1 })
  projectile_speed: number;
  
  @ApiProperty({ example: 'Empire', description: '문명 이름' })
  civilization: string;
}
