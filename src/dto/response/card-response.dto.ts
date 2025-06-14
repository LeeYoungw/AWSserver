import { ApiProperty } from '@nestjs/swagger';

export class CardResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Warrior' })
  name: string;

  @ApiProperty({ example: 2, nullable: true })
  level: number | null;
}
