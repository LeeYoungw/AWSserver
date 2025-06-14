import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '67a7e7e6-91fe-41c7-ba55-a3dd948f7771' })
  id: string;

  @ApiProperty({example: 'jongmin'})
  nickname: string;

  @ApiProperty({ example: 'test@example.com' })
  email: string;

  @ApiProperty({
    example: '$2b$10$TbXLvo0rPfhgnzCEfKQ7keiTQRUNE528DN2u2DStPtpKhAHZw0cW',
    description: '암호화된 비밀번호',
  })
  password: string;

  @ApiProperty({ example: 1 })
  level: number;

  @ApiProperty({ example: 0 })
  trophies: number;

  @ApiProperty({ example: 29 })
  gold: number;

  @ApiProperty({ example: 50 })
  diamond: number;

  @ApiProperty({ example: 0 })
  exp: number;

  @ApiProperty({ example: null, nullable: true })
  last_login: Date;

  @ApiProperty({ example: '2025-04-10T06:27:10.000Z' })
  created_at: Date;

  @ApiProperty({ example: 0 })
  streak: number;

  @ApiProperty({ example: 0 })
  total_attendance: number;

  @ApiProperty({ example: 3 })
  today_win_count: number;
}
