import { Module } from '@nestjs/common';
import { GooglePurchaseService } from './google-purchase.service';

@Module({
  providers: [GooglePurchaseService],
  exports: [GooglePurchaseService],
})
export class GooglePurchaseModule {}
