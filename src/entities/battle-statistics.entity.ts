// battle-statistics.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
  } from 'typeorm';
  import { User } from './user.entity';
  
  @Entity('battle_statistics')
export class BattleStatistics {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.statistics)
  @JoinColumn()  // 외래키 설정
  user: User;

  @Column({ default: 0 })
  total_wins: number;

  @Column({ default: 0 })
  trophies: number;

  @Column({ default: 0 })
  average_mana_cost: number;

  @Column({ type: 'json', nullable: true })
  frequent_cards: number[];

  @Column({ default: 0 })
  total_kills: number;

  @Column({ default: 0 })
  owned_card_count: number;

  @Column({ nullable: true })
  civilization: string;

  @Column({ nullable: true })
  most_used_card_id: number;
}

  