import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
  } from 'typeorm';
  import { BattlePass } from './battle-pass.entity';
  import { BattlePassReward } from './battle-pass-reward.entity';
  
  @Entity('battle_pass_mission')
  export class BattlePassMission {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => BattlePass, (pass) => pass.missions, {
      onDelete: 'CASCADE',
    })
    battlePass: BattlePass;
  
    @Column()
    level: number;
  
    @Column()
    description: string;
  
    @Column({ type: 'tinyint', default: 0 }) // 0 = 미완료, 1 = 완료
    is_completed: boolean;
  
    @OneToMany(() => BattlePassReward, (reward) => reward.mission)
    rewards: BattlePassReward[];
  }
  