// src/entities/card.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Civilization } from './civilization.entity';
import { UserCard } from './user-card.entity';
import { CardLevelStats } from './card-level-stats.entity';
import { DeckSlot } from './deck-slot.entity';

export enum CardType {
  UNIT = 'unit',
  SPELL = 'spell',
  BUILDING = 'tower',
}

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

@Column({ name: 'card_code', type: 'varchar', length: 50, unique: true })
cardCode: string;


  @Column({ type: 'enum', enum: CardType })
  type: CardType;

  @Column({ name: 'mana_cost', type: 'int' })
  manaCost: number;

  @Column({ name: 'max_health', type: 'int' })
  maxHealth: number;

  @Column({ type: 'int' })
  attack: number;

  @Column({ name: 'movement_speed', type: 'float' })
  movementSpeed: number;

  @Column({ name: 'attack_range', type: 'float' })
  attackRange: number;

  @Column({ name: 'vision_range', type: 'float' })
  visionRange: number;

  @Column({ name: 'attack_speed', type: 'float' })
  attackSpeed: number;

  @Column({ name: 'hitbox_size', type: 'float' })
  hitboxSize: number;

  @Column({ name: 'summon_time', type: 'float' })
  summonTime: number;

  @Column({ name: 'projectile_speed', type: 'float' })
  projectileSpeed: number;

  @ManyToOne(() => Civilization, (civ) => civ.cards, { nullable: true })
  @JoinColumn({ name: 'civilizationId' })
  civilization: Civilization;

  @OneToMany(() => UserCard, (userCard) => userCard.card)
  userCards: UserCard[];

  @OneToMany(() => CardLevelStats, (levelStats) => levelStats.card)
  levelStats: CardLevelStats[];

  @OneToMany(() => DeckSlot, (deckSlot) => deckSlot.card)
  deckSlots: DeckSlot[];
}
