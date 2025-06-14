import { ApiProperty } from '@nestjs/swagger';

export class SimpleCardDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Warrior' })
  name: string;

  @ApiProperty({ example: 'unit' })
  type: string;
}

export class UserCardResponseDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: 1 })
  level: number;

  @ApiProperty({ example: 8 })
  quantity: number;

  @ApiProperty({ example: false })
  upgradeable: boolean;

  @ApiProperty({ type: SimpleCardDto })
  card: SimpleCardDto;
}


export class UserCardsWithTotalDto {
  @ApiProperty({ example: 42, description: '게임 전체 카드 개수' })
  totalCardsInGame: number;

  @ApiProperty({ example: 17, description: '유저가 보유한 카드 개수' })
  userOwnedCardCount: number;

  @ApiProperty({
    type: [UserCardResponseDto],
    description: '유저가 보유한 카드 목록',
  })
  userCards: UserCardResponseDto[];
}

export class UpgradeCardResponseDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: 2 })
  level: number;

  @ApiProperty({ example: 3 })
  quantity: number;

  @ApiProperty({ example: false })
  upgradeable: boolean;

  @ApiProperty({ type: SimpleCardDto })
  card: SimpleCardDto;
}