import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { DeckSlot } from './deck-slot.entity';

@Entity('user_deck')
export class UserDeck {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.decks, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: false })
  is_selected: boolean;

  @OneToMany(() => DeckSlot, (slot) => slot.deck)
  slots: DeckSlot[];
}

