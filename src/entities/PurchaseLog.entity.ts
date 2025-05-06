import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
  } from 'typeorm';
  import { User } from './user.entity';
  
  @Entity()
  export class PurchaseLog {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, (user) => user.googlePurchaseLogs, { onDelete: 'CASCADE' })
    user: User;
  
    @Column()
    packageName: string;
  
    @Column()
    productId: string;
  
    @Column()
    purchaseToken: string;
  
    @Column({ nullable: true })
    orderId: string;
  
    @Column({ nullable: true })
    purchaseState: number;
  
    @Column({ nullable: true })
    consumptionState: number;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  