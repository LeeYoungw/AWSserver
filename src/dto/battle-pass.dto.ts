import { ApiProperty } from '@nestjs/swagger';
import { Type,Transform  } from 'class-transformer';
import { IsBoolean, IsInt, Min, IsOptional, } from 'class-validator';

export class SetPremiumDto {
  @ApiProperty({ example: true, description: '프리미엄 여부 (true: 유료, false: 무료)' })
  @IsBoolean()
  premium: boolean;
}

export class GetSeasonRewardDto {
  @ApiProperty({ example: 1, description: '조회할 시즌 번호 (양의 정수)' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  season: number;

  @ApiProperty({
    example: false,
    description: '미션 정보 포함 여부 (true: 포함, false: 미포함)',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @Type(() => Boolean)
  withMission?: boolean;
}

