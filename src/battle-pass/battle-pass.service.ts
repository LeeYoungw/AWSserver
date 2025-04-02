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
  // 유료 패스 버전 확인
  async setPremium(userId: string, premium: boolean): Promise<BattlePass> {
    const pass = await this.battlePassRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!pass) throw new NotFoundException('Battle Pass not found');
    pass.is_premium = premium;
    return this.battlePassRepo.save(pass);
  }
  // 미션 완료
  async completeMission(userId: string, missionId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const pass = await this.battlePassRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!pass) throw new NotFoundException('Battle Pass not found');

    const mission = await this.missionRepo.findOne({
      where: { id: missionId },
      relations: ['rewards'],
    });
    if (!mission || mission.battlePass.id !== pass.id) {
      throw new BadRequestException('Invalid mission for user');
    }

    if (mission.is_completed) {
      throw new BadRequestException('Mission already completed');
    }

    mission.is_completed = true;
    await this.missionRepo.save(mission);

    for (const reward of mission.rewards) {
      if (reward.is_premium && !pass.is_premium) continue;

      if (reward.reward_type === 'gold') user.gold += reward.amount;
      else if (reward.reward_type === 'diamond') user.diamond += reward.amount;
      // TODO: 카드나 다른 보상도 필요 시 처리
    }
    await this.userRepo.save(user);

    return { message: '보상이 지급되었습니다.', rewards: mission.rewards };
  }
}
