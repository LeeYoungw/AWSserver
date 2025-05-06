// src/purchase/purchase.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PurchaseLog } from '../entities/PurchaseLog.entity';
import { Repository } from 'typeorm';
import { CreatePurchaseLogDto } from '../dto/create-purchase-log.dto';
import { User } from '../entities/user.entity';
import { GooglePurchaseService } from '../googlepurchase/google-purchase.service';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(PurchaseLog)
    private purchaseRepo: Repository<PurchaseLog>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly googlePurchaseService: GooglePurchaseService,
  ) {}
  // 결제 내역 생성
  async create(dto: CreatePurchaseLogDto): Promise<PurchaseLog> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new Error('User not found');

    const purchaseData = await this.googlePurchaseService.verifyPurchase(
      dto.packageName,
      dto.productId,
      dto.purchaseToken,
    );

    const purchase = this.purchaseRepo.create({
      user,
      packageName: dto.packageName,
      productId: dto.productId,
      purchaseToken: dto.purchaseToken,
      orderId: purchaseData.orderId,
      purchaseState: purchaseData.purchaseState,
      consumptionState: purchaseData.consumptionState,
    });

    return this.purchaseRepo.save(purchase);
  }

  async findAll(): Promise<PurchaseLog[]> {
    return this.purchaseRepo.find({ relations: ['user'] });
  }
}
