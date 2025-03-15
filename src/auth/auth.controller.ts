import { Controller, Get, Post, Body, Param, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 전체 사용자 목록 조회 API
  @Get()
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  // 특정 사용자 조회 API (ID 기반)
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.authService.getUserById(id);
  }

  // 회원가입 API
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto.email, registerDto.password);
  }

  // 로그인 API (커스텀 토큰 반환)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
