// src/purchase/purchase.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseLog } from '../entities/PurchaseLog.entity';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { User } from '../entities/user.entity';
import { GooglePurchaseService } from '../googlepurchase/google-purchase.service';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseLog, User])],
  controllers: [PurchaseController],
  providers: [PurchaseService, GooglePurchaseService],
})
export class PurchaseModule {}
