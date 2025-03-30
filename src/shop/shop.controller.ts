import { Controller, Get, Param, Post } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Shop')
@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @ApiOperation({ summary: '상점 아이템 생성' })
  @ApiResponse({ status: 201, description: '상점 아이템이 생성되었습니다.' })
  @Post('generate/:userId')
  generateShopItems(@Param('userId') userId: string) {
    return this.shopService.generateShopItems(userId);
  }

  @ApiOperation({ summary: '현재 상점 아이템 조회' })
  @ApiResponse({ status: 200, description: '유효한 상점 아이템 목록 반환' })
  @Get(':userId')
  getShopItems(@Param('userId') userId: string) {
    return this.shopService.getShopItems(userId);
  }

  @ApiOperation({ summary: '상점 아이템 구매' })
  @ApiResponse({ status: 201, description: '아이템 구매 성공' })
  @Post('purchase/:userId/:itemId')
  purchaseItem(
    @Param('userId') userId: string,
    @Param('itemId') itemId: number,
  ) {
    return this.shopService.purchaseItem(userId, itemId);
  }
}
