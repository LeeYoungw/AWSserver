import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { BattlePassMission } from './battle-pass-mission.entity';

@Entity('battle_pass')
export class BattlePass {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.battlePasses, {
    onDelete: 'CASCADE',
  })
  user: User;

  @OneToMany(() => BattlePassMission, (mission) => mission.battlePass, {
    cascade: true,
  })
  missions: BattlePassMission[];

  @Column({ default: 0 })
  battle_pass_xp: number;

  @Column({ default: 1 })
  battle_pass_level: number;

  @Column({ type: 'tinyint', default: 1 })
  is_active: boolean;

  @Column({ type: 'tinyint', default: 0 }) // 0 = 무료, 1 = 유료
  is_premium: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  last_updated: Date;

@Column({ default: 1 })
season: number;

}
