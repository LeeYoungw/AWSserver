<<<<<<< HEAD
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 전체 사용자 조회
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  // 특정 사용자 조회 (ID 기반)
  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  // 회원가입 (비밀번호 해싱 후 저장)
  async register(email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ email, password: hashedPassword });
    await this.userRepository.save(user);

    // Firebase에 사용자 생성
    await admin.auth().createUser({
      uid: user.id.toString(),
      email,
      password,
    });

    return user;
  }

  // 커스텀 토큰 생성
  async generateCustomToken(uid: string): Promise<string> {
    const customToken = await admin.auth().createCustomToken(uid);
    return customToken;
  }

  // 로그인 (Firebase 커스텀 토큰 사용)
  async login(email: string, password: string): Promise<{ customToken: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('이메일이 존재하지 않습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
    }

    // 커스텀 토큰 생성 및 반환
    const customToken = await this.generateCustomToken(user.id.toString());
    return { customToken };
  }
}
=======
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 전체 사용자 조회
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  // 특정 사용자 조회 (ID 기반)
  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  // 회원가입 (비밀번호 해싱 후 저장)
  async register(email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ email, password: hashedPassword });
    await this.userRepository.save(user);

    // Firebase에 사용자 생성
    await admin.auth().createUser({
      uid: user.id.toString(),
      email,
      password,
    });

    return user;
  }

  // 커스텀 토큰 생성
  async generateCustomToken(uid: string): Promise<string> {
    const customToken = await admin.auth().createCustomToken(uid);
    return customToken;
  }

  // 로그인 (Firebase 커스텀 토큰 사용)
  async login(email: string, password: string): Promise<{ customToken: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('이메일이 존재하지 않습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
    }

    // 커스텀 토큰 생성 및 반환
    const customToken = await this.generateCustomToken(user.id.toString());
    return { customToken };
  }
}
>>>>>>> 4b8f998 (commit from ec2)
