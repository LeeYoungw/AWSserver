import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('battle_log')
export class BattleLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.battleLogsAsPlayer1, {
    onDelete: 'CASCADE',
  })
  player1: User;

  @ManyToOne(() => User, (user) => user.battleLogsAsPlayer2, {
    onDelete: 'CASCADE',
  })
  player2: User;

  @ManyToOne(() => User, (user) => user.battleLogsAsWinner, {
    onDelete: 'CASCADE',
  })
  winner: User;

  @Column()
  trophies_change: number;

  @Column()
  card_change: number;

  @Column()
  gold_change: number;
  @CreateDateColumn({ type: 'datetime' })
created_at: Date;
}
