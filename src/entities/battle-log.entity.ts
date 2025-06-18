import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { UserDeck } from './user-deck.entity';

@Entity('battle_log')
export class BattleLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.battleLogsAsPlayer1, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player1Id' })
  @Index('idx_player1Id')
  player1: User;

  @ManyToOne(() => User, (user) => user.battleLogsAsPlayer2, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player2Id' })
  @Index('idx_player2Id')
  player2: User;

@ManyToOne(() => User, (user) => user.battleLogsAsWinner, { onDelete: 'CASCADE', nullable: true })
@JoinColumn({ name: 'winnerId' })
winner: User;



  @Column()
  trophies_change: number;

  @Column()
  card_change: number;

  @Column()
  gold_change: number;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @ManyToOne(() => UserDeck, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usedDeck1Id' })
  usedDeck1: UserDeck;

  @ManyToOne(() => UserDeck, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usedDeck2Id' })
  usedDeck2: UserDeck;
}
