// auth.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'; //  ApiBody 추가

@ApiTags('Auth')
@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '전체 사용자 목록 조회' })
  @ApiResponse({ status: 200, description: '사용자 목록 반환' })
  @Get()
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @ApiOperation({ summary: '특정 사용자 조회' })
  @ApiResponse({ status: 200, description: '사용자 정보 반환' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 400, description: '이메일 또는 비밀번호 오류' })
  @ApiBody({ type: RegisterDto }) //  Swagger Body 명세 추가
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

  @ApiOperation({ summary: '구글 로그인' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idToken: { type: 'string', example: 'Google에서 받은 ID Token' },
      },
    },
  })
  @Post('google')
  async googleLogin(@Body('idToken') idToken: string) {
    return this.authService.googleLogin(idToken);
  }
}

