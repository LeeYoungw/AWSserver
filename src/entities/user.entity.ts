import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BattleLog } from './battle-log.entity';
import { BattlePass } from './battle-pass.entity';
import { UserCard } from './user-card.entity';
import { UserDeck } from './user-deck.entity';
import { ShopItemsPool } from './shop-items-pool.entity';
import { ShopPurchaseLog } from './shop-purchase-log.entity';
import { BattleStatistics } from './battle-statistics.entity';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  trophies: number;

  @Column({ default: 0 })
  gold: number;

  @Column({ default: 0 })
  diamond: number;

  @Column({ default: 0 })
  exp: number; 

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ default: 0 })
  streak: number;

  @Column({ default: 0 })
  total_attendance: number;

  @OneToMany(() => BattleLog, (log) => log.player1)
  battleLogsAsPlayer1: BattleLog[];

  @OneToMany(() => BattleLog, (log) => log.player2)
  battleLogsAsPlayer2: BattleLog[];

  @OneToMany(() => BattleLog, (log) => log.winner)
  battleLogsAsWinner: BattleLog[];

  @OneToMany(() => BattlePass, (pass) => pass.user)
  battlePasses: BattlePass[];

  @OneToMany(() => UserCard, (uc) => uc.user)
  cards: UserCard[];

  @OneToMany(() => UserDeck, (deck) => deck.user)
  decks: UserDeck[];

  @OneToMany(() => ShopItemsPool, (item) => item.user)
  shopItems: ShopItemsPool[];

  @OneToMany(() => ShopPurchaseLog, (log) => log.user)
  purchaseLogs: ShopPurchaseLog[];

  @OneToOne(() => BattleStatistics, (stats) => stats.user)
  @JoinColumn()  // 명시적으로 외래키 설정
  statistics: BattleStatistics;
}

