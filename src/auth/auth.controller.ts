// auth.controller.ts
import { Controller, Get, Post, Body, Param,Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { UserResponseDto } from 'src/dto/response/UserResponseDto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody,ApiParam } from '@nestjs/swagger'; //  ApiBody 추가
import { GoogleLoginDto } from 'src/dto/google-login.dto';
import { SetNicknameDto } from 'src/dto/set-nickname.dto';


@ApiTags('Auth')
@Controller('users')
export class AuthController {
  constructor(
  private readonly authService: AuthService
  ) {}

@ApiOperation({ summary: '전체 사용자 목록 조회' })
@ApiResponse({ status: 200, description: '사용자 목록 반환', type: UserResponseDto, isArray: true })
@Get()
async getAllUsers() {
  return this.authService.getAllUsers();
}

@ApiOperation({ summary: '특정 사용자 조회' })
@ApiResponse({ status: 200, description: '사용자 정보 반환', type: UserResponseDto })
@ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
@Get(':id')
async getUserById(@Param('id') id: string) {
  return this.authService.getUserById(id);
}


  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 400, description: '이메일 또는 비밀번호 오류' })
  @ApiBody({ type: RegisterDto })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto.email, registerDto.password);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공 및 JWT 반환' })
  @ApiResponse({ status: 401, description: '이메일 또는 비밀번호 오류' })
  @ApiBody({ type: LoginDto }) //  Swagger Body 명세 추가
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @ApiOperation({ summary: '최초 닉네임 설정 (Guest일 때만 가능)' })
@ApiParam({ name: 'uid', description: 'Firebase UID', example: 'abc123-uid' })
@ApiBody({ type: SetNicknameDto })
@ApiResponse({ status: 200, description: '닉네임 설정 성공' })
@ApiResponse({ status: 400, description: '이미 설정된 닉네임이거나 잘못된 요청' })
@ApiResponse({ status: 409, description: '중복된 닉네임' })
@Patch('nickname/initial/:uid')
async setInitialNickname(
  @Param('uid') uid: string,
  @Body() dto: SetNicknameDto,
) {
  await this.authService.setInitialNickname(uid, dto);
  return { message: '닉네임이 성공적으로 설정되었습니다.' };
}


@ApiOperation({ summary: '닉네임 변경 (누구나 가능)' })
@ApiParam({ name: 'uid', description: 'Firebase UID', example: 'abc123-uid' })
@ApiBody({ type: SetNicknameDto })
@ApiResponse({ status: 200, description: '닉네임 변경 성공' })
@ApiResponse({ status: 409, description: '중복된 닉네임' })
@Patch('nickname/:uid')
async changeNickname(
  @Param('uid') uid: string,
  @Body() dto: SetNicknameDto,
) {
  await this.authService.changeNickname(uid, dto);
  return { message: '닉네임이 변경되었습니다.' };
}

@ApiOperation({ summary: '구글 로그인' })
@ApiBody({ type: GoogleLoginDto })
@Post('google')
async googleLogin(@Body() dto: GoogleLoginDto) {
  return this.authService.googleLogin(dto.idToken);
}
}
