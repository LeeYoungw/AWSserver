import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserDailyMission } from '../entities/user_daily_mission.entity';
import { DailyMission } from '../entities/daily_mission.entity';
import { BattleLog } from '../entities/battle-log.entity';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class DailyMissionService {
  constructor(
    @InjectRepository(UserDailyMission)
    private readonly userMissionRepo: Repository<UserDailyMission>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(DailyMission)
    private readonly missionRepo: Repository<DailyMission>,

    @InjectRepository(BattleLog)
    private readonly battleLogRepo: Repository<BattleLog>,
  ) {}

  async getUserDailyMissions(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

    return this.userMissionRepo.find({
      where: { user: { id: userId } },
      relations: ['mission'],
    });
  }

  async completeMission(userId: string, missionId: number) {
    const mission = await this.userMissionRepo.findOne({
      where: { user: { id: userId }, mission: { id: missionId } },
      relations: ['mission'],
    });

    if (!mission) throw new NotFoundException('미션을 찾을 수 없습니다.');
    if (mission.is_completed) throw new BadRequestException('이미 완료된 미션입니다.');

    mission.is_completed = true;
    await this.userMissionRepo.save(mission);

    return { message: '미션 완료 처리됨.' };
  }

  async claimReward(userId: string, missionId: number) {
    const mission = await this.userMissionRepo.findOne({
      where: { user: { id: userId }, mission: { id: missionId } },
      relations: ['mission', 'user'],
    });

    if (!mission) throw new NotFoundException('미션을 찾을 수 없습니다.');
    if (!mission.is_completed) throw new BadRequestException('아직 미션을 완료하지 않았습니다.');
    if (mission.is_claimed) throw new BadRequestException('이미 보상을 받았습니다.');

    mission.is_claimed = true;

    const user = mission.user;
    const reward = mission.mission;

    if (reward.reward_type === 'gold') user.gold += reward.reward_amount;
    else if (reward.reward_type === 'exp') user.exp += reward.reward_amount;
    else if (reward.reward_type === 'diamond') user.diamond += reward.reward_amount;

    await this.userMissionRepo.save(mission);
    await this.userRepo.save(user);

    return {
      message: '보상이 지급되었습니다.',
      reward_type: reward.reward_type,
      amount: reward.reward_amount,
    };
  }

  // 배틀로그 관련 하루 승리 카운트 함수 활용 함수수
  async evaluateWinMissions(userId: string) {
  const user = await this.userRepo.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');

  const winCount = user.today_win_count;
  if (winCount >= 1) await this.markDailyMissionCompleted(userId, 'BATTLE_WIN');
  if (winCount >= 2) await this.markDailyMissionCompleted(userId, 'BATTLE_WIN_X2');
  if (winCount >= 3) await this.markDailyMissionCompleted(userId, 'BATTLE_WIN_X3');
}
  // 배틀로그 관련 미션 완료 함수
  async markDailyMissionCompleted(userId: string, missionType: string) {
    const today = new Date();
    const missionEntry = await this.userMissionRepo.findOne({
      where: {
        user: { id: userId },
        mission: { mission_type: missionType },
        is_completed: false,
        date: today,
      },
      relations: ['mission'],
    });

    if (missionEntry) {
      missionEntry.is_completed = true;
      await this.userMissionRepo.save(missionEntry);
    }
  }
}
