import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BattlePass } from '../entities/battle-pass.entity';
import { User } from '../entities/user.entity';
import { BattlePassMission } from '../entities/battle-pass-mission.entity';
import { BattlePassReward } from '../entities/battle-pass-reward.entity';
import { GroupedMissionRewardDto } from 'src/dto/response/battlepassreward-response.dto';
import { BattlePassMissionSummaryDto } from 'src/dto/battlepassmission.dto';

@Injectable()
export class BattlePassService {
  constructor(
    @InjectRepository(BattlePass)
    private battlePassRepo: Repository<BattlePass>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(BattlePassMission)
    private missionRepo: Repository<BattlePassMission>,

    @InjectRepository(BattlePassReward)
    private rewardRepo: Repository<BattlePassReward>,
  ) {}

  // 패스 레벨업 및 경험치 증가
  async incrementXp(userId: string): Promise<BattlePass> {
    const pass = await this.battlePassRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'missions'],
    });
    if (!pass) throw new NotFoundException('Battle Pass not found');

    pass.battle_pass_xp += 1;

    const xpToLevelUp = 10;
    if (pass.battle_pass_xp >= xpToLevelUp) {
      pass.battle_pass_level += 1;
      pass.battle_pass_xp = 0;

      const mission = this.missionRepo.create({
        battlePass: pass,
        level: pass.battle_pass_level,
        description: `${pass.battle_pass_level}레벨 미션`,
        is_completed: false,
      });
      await this.missionRepo.save(mission);
    }

    return this.battlePassRepo.save(pass);
  }

  // 유료 패스 버전 설정
  async setPremium(userId: string, premium: boolean): Promise<BattlePass> {
    const pass = await this.battlePassRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!pass) throw new NotFoundException('Battle Pass not found');
    pass.is_premium = premium;
    return this.battlePassRepo.save(pass);
  }

  // 미션 완료 및 보상 지급
  async completeMission(userId: string, missionId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const pass = await this.battlePassRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!pass) throw new NotFoundException('Battle Pass not found');

    const mission = await this.missionRepo.findOne({
      where: { id: missionId },
      relations: ['rewards', 'battlePass'],
    });
    if (!mission || mission.battlePass?.id !== pass.id) {
      throw new BadRequestException('Invalid mission for user');
    }
    if (mission.is_completed) {
      throw new BadRequestException('Mission already completed');
    }

    mission.is_completed = true;
    await this.missionRepo.save(mission);

    if (!mission.rewards || mission.rewards.length === 0) {
      throw new BadRequestException('No rewards available for this mission');
    }

    for (const reward of mission.rewards) {
      if (reward.is_premium && !pass.is_premium) continue;

      if (reward.reward_type === 'gold') user.gold += reward.amount;
      else if (reward.reward_type === 'diamond') user.diamond += reward.amount;
    }
    await this.userRepo.save(user);

    return { message: '보상이 지급되었습니다.', rewards: mission.rewards };
  }

async getGroupedRewardsBySeason(season: number): Promise<GroupedMissionRewardDto[]> {
  const missions = await this.missionRepo
    .createQueryBuilder('mission')
    .leftJoinAndSelect('mission.rewards', 'reward')
    .leftJoinAndSelect('mission.battlePass', 'battlePass')
    .where('battlePass.season = :season', { season })
    .orderBy('mission.level', 'ASC')
    .getMany();

  return missions.map((mission) => ({
    level: mission.level,
    mission_description: mission.description,
    is_completed: mission.is_completed,
    rewards: mission.rewards.map((r) => ({
      reward_type: r.reward_type,
      amount: r.amount,
      is_premium: r.is_premium,
      reward_id: r.id,
    })),
  }));
}
}