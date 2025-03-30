import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'test@example.com', description: '유저 이메일' })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력하세요.' })
  email: string;

  @ApiProperty({ example: 'password123', description: '비밀번호 (최소 6자리)' })
  @IsNotEmpty({ message: '비밀번호를 입력하세요.' })
  @MinLength(6, { message: '비밀번호는 최소 6자리 이상이어야 합니다.' })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'test@example.com', description: '유저 이메일' })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력하세요.' })
  email: string;

  @ApiProperty({ example: 'password123', description: '비밀번호 (최소 6자리)' })
  @IsNotEmpty({ message: '비밀번호를 입력하세요.' })
  @MinLength(6, { message: '비밀번호는 최소 6자리 이상이어야 합니다.' })
  password: string;
}
