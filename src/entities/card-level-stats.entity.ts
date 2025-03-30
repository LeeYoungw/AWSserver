import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Card } from './card.entity';

@Entity('card_level_stats')
export class CardLevelStats {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Card, (card) => card.levelStats, { onDelete: 'CASCADE' })
  card: Card;

  @Column()
  level: number;

  @Column()
  health: number;

  @Column()
  attack: number;

  @Column('float')
  attack_speed: number;
}
