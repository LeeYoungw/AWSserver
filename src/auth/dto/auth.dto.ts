import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력하세요.' })
  email: string;

  @IsNotEmpty({ message: '비밀번호를 입력하세요.' })
  @MinLength(6, { message: '비밀번호는 최소 6자리 이상이어야 합니다.' })
  password: string;
}

export class LoginDto {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력하세요.' })
  email: string;

  @IsNotEmpty({ message: '비밀번호를 입력하세요.' })
  @MinLength(6, { message: '비밀번호는 최소 6자리 이상이어야 합니다.' })
  password: string;
}
