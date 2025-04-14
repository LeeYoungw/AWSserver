import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
  } from 'typeorm';
  import { User } from './user.entity';
  import { Card } from './card.entity';
  
  @Entity('user_card')
  export class UserCard {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, (user) => user.cards, { onDelete: 'CASCADE' })
    user: User;
  
    @ManyToOne(() => Card, (card) => card.userCards, { onDelete: 'CASCADE' })
    card: Card;
  
    @Column()
    level: number;
  
    @Column()
    quantity: number;
  
    @Column({ default: false })
    upgradeable: boolean;

    @Column({default : 0})
    usage_count: number;

  }
  


