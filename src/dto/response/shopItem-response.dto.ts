import { ApiProperty } from '@nestjs/swagger';

export class ShopItemResponseDto {
  @ApiProperty({ example: 41 })
  id: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 185 })
  price: number;

  @ApiProperty({ example: 'gold' })
  currency: string;

  @ApiProperty({ example: '2025-05-23T10:30:40.000Z' })
  created_at: string;

  @ApiProperty({ example: '2025-05-24T10:30:40.000Z' })
  expires_at: string;

  @ApiProperty({ example: false })
  is_purchased: boolean;

  @ApiProperty({ example: 1 })
  card_id: number;

  @ApiProperty({ example: 'Warrior' })
  card_name: string;
}

export class UserCardDto {
  @ApiProperty({ example: 7 })
  id: number;

  @ApiProperty({ example: 1 })
  level: number;

  @ApiProperty({ example: 7 })
  quantity: number;

  @ApiProperty({ example: false })
  upgradeable: boolean;

  @ApiProperty({ example: 2 })
  usage_count: number;
}

export class PurchaseResponseDto {
  @ApiProperty({ example: '구매 완료' })
  message: string;

  @ApiProperty({ type: ShopItemResponseDto })
  item: ShopItemResponseDto;

  @ApiProperty({ type: UserCardDto })
  userCard: UserCardDto;
}



