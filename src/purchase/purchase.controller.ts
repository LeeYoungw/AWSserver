// src/purchase/purchase.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseLogDto } from '../dto/create-purchase-log.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Purchase') 
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @ApiOperation({ summary: '결제 정보 저장' })
  @Post()
  async create(@Body() dto: CreatePurchaseLogDto) {
    return this.purchaseService.create(dto);
  }

  @ApiOperation({ summary: '전체 결제 내역 조회' })
  @Get()
  async findAll() {
    return this.purchaseService.findAll();
  }
}
