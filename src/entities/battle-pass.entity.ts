import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('battle_pass')
export class BattlePass {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.battlePasses, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ default: 0 })
  battle_pass_xp: number;

  @Column({ default: 1 })
  battle_pass_level: number;

  @Column({ type: 'tinyint', default: 1 })
  is_active: boolean;

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
}
