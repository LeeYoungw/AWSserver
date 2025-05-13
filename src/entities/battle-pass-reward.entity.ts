import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
  } from 'typeorm';
  import { BattlePassMission } from './battle-pass-mission.entity';
  
  @Entity('battle_pass_reward')
  export class BattlePassReward {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => BattlePassMission, (mission) => mission.rewards, {
      onDelete: 'CASCADE',
    })
    mission: BattlePassMission;
  
    @Column()
    reward_type: string; // 예: "gold", "card", "skin" 등
  
    @Column()
    amount: number;
  
    @Column({ type: 'tinyint', default: 0 }) // 0 = 무료, 1 = 유료
    is_premium: boolean;

    @Column({ default: 1 })
    season: number;
  }
  