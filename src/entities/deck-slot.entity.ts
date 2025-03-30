import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
  } from 'typeorm';
  import { Card } from './card.entity';
  import { UserDeck } from './user-deck.entity';
  
  @Entity('deck_slots')
  export class DeckSlot {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => UserDeck, (deck) => deck.slots, { onDelete: 'CASCADE' })
    deck: UserDeck;
  
    @ManyToOne(() => Card, (card) => card.deckSlots, { onDelete: 'CASCADE' })
    card: Card;
  
    @Column()
    slot: number;
  }
  