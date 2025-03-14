<<<<<<< HEAD
import { Controller, Get, Post, Body, Param, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

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
  async register(@Body('email') email: string, @Body('password') password: string) {
    if (!email || !password) {
      throw new BadRequestException('이메일과 비밀번호를 입력하세요.');
    }
    return this.authService.register(email, password);
  }

  // 로그인 API (커스텀 토큰 반환)
  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    if (!email || !password) {
      throw new BadRequestException('이메일과 비밀번호를 입력하세요.');
    }
    return this.authService.login(email, password);
  }
}
=======
import { Controller, Get, Post, Body, Param, ParseIntPipe, BadRequestException, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 전체 사용자 목록 조회 API
  @Get()
  async getAllUsers() {
    return this.authService.getAllUsers();
  }
 
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
  return {
    message: 'Google login successful',
    user: req.user,
};
}
 
  // 특정 사용자 조회 API (ID 기반)
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.authService.getUserById(id);
  }

  // 회원가입 API
  @Post('register')
  async register(@Body('email') email: string, @Body('password') password: string) {
    if (!email || !password) {
      throw new BadRequestException('이메일과 비밀번호를 입력하세요.');
    }
    return this.authService.register(email, password);
  }

  // 로그인 API (커스텀 토큰 반환)
  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    if (!email || !password) {
      throw new BadRequestException('이메일과 비밀번호를 입력하세요.');
    }
    return this.authService.login(email, password);
  }

}

>>>>>>> 4b8f998 (commit from ec2)
