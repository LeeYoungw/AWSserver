import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('match_status')
export class MatchStatus {
  @PrimaryColumn({ name: 'player_id', type: 'varchar', length: 64 })
  playerId: string;

  @Column({ type: 'enum', enum: ['waiting', 'ready'] })
  status: 'waiting' | 'ready';

  @Column({ name: 'opponent_id', type: 'varchar', length: 64, nullable: true })
  opponentId?: string;

  @Column({ name: 'room_id', type: 'varchar', length: 64, nullable: true })
  roomId?: string;

  @Column({ name: 'deck_json', type: 'json' })
  deckJson: any;

  @CreateDateColumn({ name: 'requested_at', type: 'datetime' })
  requestedAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
