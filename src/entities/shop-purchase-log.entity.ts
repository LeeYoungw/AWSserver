import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { User } from './user.entity';
  import { ShopItemsPool } from './shop-items-pool.entity';
  import { CurrencyType } from './enum';
  
  @Entity('shop_purchase_log')
  export class ShopPurchaseLog {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, (user) => user.purchaseLogs)
    user: User;
  
    @ManyToOne(() => ShopItemsPool)
    item: ShopItemsPool;
  
    @Column()
    total_price: number;
  
    @Column({ type: 'enum', enum: CurrencyType })
    currency: CurrencyType;
  
    @CreateDateColumn()
    purchase_time: Date;
  }
  
