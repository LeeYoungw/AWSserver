import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { User } from './user.entity';
  import { Card } from './card.entity';
  import { CurrencyType } from './enum';
  
  @Entity('shop_items_pool')
  export class ShopItemsPool {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, (user) => user.shopItems, { onDelete: 'CASCADE' })
    user: User;
  
    @ManyToOne(() => Card, { onDelete: 'CASCADE' })
    card: Card;
  
    @Column()
    quantity: number;
  
    @Column()
    price: number;
  
    @Column({ type: 'enum', enum: CurrencyType })
    currency: CurrencyType;
  
    @CreateDateColumn()
    created_at: Date;
  
    @Column({ type: 'timestamp' })
    expires_at: Date;
  
    @Column({ default: false })
    is_purchased: boolean;
  }
  
