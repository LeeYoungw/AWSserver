import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as path from 'path';

@Injectable()
export class GooglePurchaseService {
  private androidPublisher;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../../credentials/google-play-service-account.json'), // 서비스 계정 키 파일
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    this.androidPublisher = google.androidpublisher({
      version: 'v3',
      auth,
    });
  }

  async verifyPurchase(packageName: string, productId: string, purchaseToken: string) {
    try {
      const res = await this.androidPublisher.purchases.products.get({
        packageName,
        productId,
        token: purchaseToken,
      });

      return res.data; // 응답 객체: purchaseState, consumptionState, orderId 등 포함
    } catch (error) {
      throw new Error('Google Play 결제 검증 실패: ' + error.message);
    }
  }
}
