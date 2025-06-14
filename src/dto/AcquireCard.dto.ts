import { ApiProperty,ApiPropertyOptional } from '@nestjs/swagger';
import { CardType } from '../entities/card.entity';
import { IsEnum } from 'class-validator';
export class AcquireCardDto {
  @ApiProperty({
    example: '67a7e7e6-91fe-41c7-ba55-a3dd948f7771',
    description: '유저의 고유 ID',
  })
  userId: string;

  @ApiProperty({
    example: 1,
    description: '획득할 카드의 ID',
  })
  cardId: number;
  @ApiPropertyOptional({
    example: 3,
    description: '획득할 카드의 추가 수량 (기본값: 1)',
  })
  quantity?: number;
}
export class GetUserCardDto {
  @ApiPropertyOptional({
    enum: CardType,
    description: '카드 타입 (unit, spell, building)',
    example: CardType.UNIT,
  })
  @IsEnum(CardType)
  type?: CardType;
}

export class GetCardDetailDto {
  @ApiProperty({ example: 101, description: '카드 ID' })
  cardId: number;
}
export class UpgradeCardDto {
  @ApiProperty({ example: 'user-uuid-123', description: '유저 ID' })
  userId: string;

  @ApiProperty({ example: 1, description: '카드 ID' })
  cardId: number;
}