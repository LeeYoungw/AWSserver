// google-purchase.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { GooglePurchaseService } from './google-purchase.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Google Purchase')
@Controller('google-purchase')
export class GooglePurchaseController {
  constructor(private readonly googlePurchaseService: GooglePurchaseService) {}

  @Post('verify')
  @ApiOperation({ summary: '구글 결제 검증' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        packageName: { type: 'string', example: 'com.example.app' },
        productId: { type: 'string', example: 'product_123' },
        purchaseToken: { type: 'string', example: 'purchase_token_example' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '검증 결과 반환' })
  async verify(@Body() body: { packageName: string; productId: string; purchaseToken: string }) {
    return this.googlePurchaseService.verifyPurchase(body.packageName, body.productId, body.purchaseToken);
  }
}
