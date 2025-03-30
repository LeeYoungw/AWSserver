// card.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
  } from 'typeorm';
  import { Civilization } from './civilization.entity';
  import { UserCard } from './user-card.entity';
  import { DeckSlot } from './deck-slot.entity';
  import { CardLevelStats } from './card-level-stats.entity';
  
  export enum CardType {
    UNIT = 'unit',
    SPELL = 'spell',
    BUILDING = 'building',
  }
  
  @Entity('cards')
  export class Card {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column({ type: 'enum', enum: CardType })
    type: CardType;
  
    @ManyToOne(() => Civilization, (civ) => civ.cards)
    civilization: Civilization;
  
    @Column()
    mana_cost: number;
  
    @Column()
    max_health: number;
  
    @Column()
    attack: number;
  
    @Column('float')
    movement_speed: number;
  
    @Column('float')
    attack_range: number;
  
    @Column('float')
    vision_range: number;
  
    @Column('float')
    attack_speed: number;
  
    @Column('float')
    hitbox_size: number;
  
    @Column('float')
    summon_time: number;
  
    @Column('float')
    projectile_speed: number;
  
    @OneToMany(() => UserCard, (userCard) => userCard.card)
    userCards: UserCard[];
  
    @OneToMany(() => DeckSlot, (slot) => slot.card)
    deckSlots: DeckSlot[];
  
    @OneToMany(() => CardLevelStats, (stats) => stats.card)
    levelStats: CardLevelStats[];
  }
  
