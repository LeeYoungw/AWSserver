import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { BattlePass } from '../entities/battle-pass.entity';
import { DailyMission } from 'src/entities/daily_mission.entity';
import { UserDailyMission } from 'src/entities/user_daily_mission.entity';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(BattlePass)
    private battlePassRepo: Repository<BattlePass>,

    @InjectRepository(DailyMission)
    private dailyMissionRepo: Repository<DailyMission>,

    @InjectRepository(UserDailyMission)
    private userDailyMissionRepo: Repository<UserDailyMission>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async register(email: string, password: string): Promise<User> {
  const existingUser = await this.userRepository.findOne({ where: { email } });
  if (existingUser) throw new ConflictException('이미 사용 중인 이메일입니다.');

  try {
    const firebaseUid = uuidv4();

    await admin.auth().createUser({ uid: firebaseUid, email, password });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      id: firebaseUid,
      email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // ✅ 배틀패스 자동 생성
    const battlePass = this.battlePassRepo.create({ user: savedUser });
    await this.battlePassRepo.save(battlePass);

    // ✅ 일일 미션 자동 생성
    const missions = await this.dailyMissionRepo.find();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userDailyMissions = missions.map((mission) =>
      this.userDailyMissionRepo.create({
        user: savedUser,
        mission,
        is_completed: false,
        is_claimed: false,
        date: today,
      })
    );

    await this.userDailyMissionRepo.save(userDailyMissions);

    return savedUser;
  } catch (error) {
    throw new InternalServerErrorException('회원가입 중 오류가 발생했습니다.');
  }
}

  async generateCustomToken(uid: string): Promise<string> {
    try {
      return await admin.auth().createCustomToken(uid);
    } catch (error) {
      throw new InternalServerErrorException(`Firebase 토큰 생성 실패: ${error.message}`);
    }
  }

  async login(email: string, password: string): Promise<{ customToken: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('이메일이 존재하지 않습니다.');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');

    try {
      const firebaseUser = await admin.auth().getUserByEmail(email);
      const customToken = await admin.auth().createCustomToken(firebaseUser.uid);
      return { customToken };
    } catch (error) {
      throw new InternalServerErrorException(`Firebase 처리 오류: ${error.message}`);
    }
  }

  async googleLogin(idToken: string): Promise<{ customToken: string }> {
    try {
      // Google OAuth2 tokeninfo endpoint로 ID 토큰 검증
      const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      const { sub: uid, email } = response.data;
  
      if (!uid || !email) {
        throw new Error('ID 토큰 검증 실패: UID 또는 이메일 없음');
      }
  
      // 디비에 현재 구글로 로그인한 유저가 있는지 확인
      let user = await this.userRepository.findOne({ where: { id: uid } });
  
      // 없다면 회원가입 처리
      if (!user) {
        user = this.userRepository.create({
          id: uid,
          email,
          password: '', // OAuth 기반 로그인은 비밀번호 미사용이다다
        });
        user = await this.userRepository.save(user);
  
        const battlePass = this.battlePassRepo.create({ user });
        await this.battlePassRepo.save(battlePass);
      }
  
      // Firebase 커스텀 토큰 생성 
      const customToken = await this.generateCustomToken(uid);
      return { customToken };
    } 
    catch (error) {
      throw new UnauthorizedException('구글 로그인 실패: ' + error.message);
    }
  }
  }

