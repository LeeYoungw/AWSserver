import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ✅ 전체 사용자 조회
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  // ✅ 특정 사용자 조회 (ID 기반)
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

 // ✅ 회원가입 (Firebase UID와 MySQL ID 동기화)
async register(email: string, password: string): Promise<User> {
  // 1️⃣ 이메일 중복 확인
  const existingUser = await this.userRepository.findOne({ where: { email } });
  if (existingUser) {
    throw new ConflictException('이미 사용 중인 이메일입니다.');
  }

  try {
    // 2️⃣ 랜덤 UID 생성 (UUID 사용)
    const firebaseUid = uuidv4();

    // 3️⃣ Firebase 사용자 생성
    try {
      await admin.auth().createUser({
        uid: firebaseUid,  // ✅ 랜덤 UID 적용
        email,
        password,
      });
    } catch (firebaseError) {
      throw new InternalServerErrorException(`Firebase 사용자 생성 실패: ${firebaseError.message}`);
    }

    // 4️⃣ 비밀번호 해싱 후 MySQL에 저장 (Firebase UID를 ID로 사용)
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      id: firebaseUid,  // ✅ Firebase UID를 MySQL의 ID로 사용
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    return user;
  } catch (error) {
    throw new InternalServerErrorException('회원가입 중 오류가 발생했습니다.');
  }
}
  // ✅ Firebase 커스텀 토큰 생성
  async generateCustomToken(uid: string): Promise<string> {
    try {
      const customToken = await admin.auth().createCustomToken(uid);
      return customToken;
    } catch (error) {
      throw new InternalServerErrorException(`Firebase 토큰 생성 실패: ${error.message}`);
    }
  }

  // ✅ 로그인 (Firebase 커스텀 토큰 사용)
  async login(email: string, password: string): Promise<{ customToken: string }> {
    try {
      // 1️⃣ 사용자 찾기
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        throw new UnauthorizedException('이메일이 존재하지 않습니다.');
      }

      // 2️⃣ 비밀번호 검증
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
      }

      // 3️⃣ Firebase에서 UID 찾기
      let firebaseUid: string;
      try {
        const firebaseUser = await admin.auth().getUserByEmail(email);
        firebaseUid = firebaseUser.uid;
      } catch (error) {
        throw new InternalServerErrorException(`Firebase에서 사용자 정보를 찾을 수 없습니다: ${error.message}`);
      }

      // 4️⃣ Firebase 커스텀 토큰 생성
      try {
        const customToken = await admin.auth().createCustomToken(firebaseUid);
        return { customToken };
      } catch (firebaseError) {
        throw new InternalServerErrorException(`Firebase 토큰 생성 실패: ${firebaseError.message}`);
      }
    } catch (error) {
      throw new InternalServerErrorException('로그인 중 오류가 발생했습니다.');
    }
  }
}

