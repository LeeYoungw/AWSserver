import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetPremiumDto {
  @ApiProperty({ example: true, description: '프리미엄 여부 (true: 유료, false: 무료)' })
  @IsBoolean()
  premium: boolean;
}
