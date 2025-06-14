import { Controller, Get, Param, Post } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ShopItemResponseDto, PurchaseResponseDto } from 'src/dto/response/shopItem-response.dto';

@ApiTags('Shop')
@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @ApiOperation({ summary: '상점 아이템 생성' })
  @ApiParam({
    name: 'userId',
    type: String,
    description: '유저 ID',
    example: 'abc123e4-5678-90ab-cdef-1234567890gh',
  })
  @ApiResponse({ status: 201, description: '상점 아이템이 생성되었습니다.' })
  @Post('generate/:userId')
  generateShopItems(@Param('userId') userId: string) {
    return this.shopService.generateShopItems(userId);
  }

  @ApiOperation({ summary: '현재 상점 아이템 조회' })
  @ApiParam({
    name: 'userId',
    type: String,
    description: '유저 ID',
    example: 'abc123e4-5678-90ab-cdef-1234567890gh',
  })
  @ApiResponse({
    status: 200,
    description: '유효한 상점 아이템 목록 반환',
    type: ShopItemResponseDto,
    isArray: true,
  })
  @Get(':userId')
  getShopItems(@Param('userId') userId: string) {
    return this.shopService.getShopItems(userId);
  }

  @ApiOperation({ summary: '상점 아이템 구매' })
  @ApiParam({
    name: 'userId',
    type: String,
    description: '유저 ID',
    example: 'abc123e4-5678-90ab-cdef-1234567890gh',
  })
  @ApiParam({
    name: 'itemId',
    type: Number,
    description: '아이템 ID',
    example: 2,
  })
  @ApiResponse({
    status: 201,
    description: '아이템 구매 성공',
    type: PurchaseResponseDto,
  })
  @Post('purchase/:userId/:itemId')
  purchaseItem(
    @Param('userId') userId: string,
    @Param('itemId') itemId: number,
  ) {
    return this.shopService.purchaseItem(userId, itemId);
  }
}