import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { DailyMission } from '../entities/daily_mission.entity';
import { UserDailyMission } from '../entities/user_daily_mission.entity';

@Injectable()
export class DailyMissionScheduler {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(DailyMission)
    private readonly missionRepo: Repository<DailyMission>,
    @InjectRepository(UserDailyMission)
    private readonly userMissionRepo: Repository<UserDailyMission>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetDailyMissions() {
    console.log(' [스케줄러] 일일 미션 초기화 시작');

    const users = await this.userRepo.find();
    const missions = await this.missionRepo.find();

    const today = new Date();
    today.setHours(0, 0, 0, 0); // 날짜만 비교하도록 세팅

    for (const user of users) {
      for (const mission of missions) {
        const existing = await this.userMissionRepo.findOne({
          where: { user: { id: user.id }, mission: { id: mission.id }, date: today },
        });

        if (!existing) {
          const newMission = this.userMissionRepo.create({
            user,
            mission,
            is_completed: false,
            is_claimed: false,
            date: today,
          });
          await this.userMissionRepo.save(newMission);
        }
      }
    }
    await this.resetTodayWinCounts();
    console.log(' [스케줄러] 일일 미션 초기화 완료');
  }
  async resetTodayWinCounts() {
  await this.userRepo.createQueryBuilder()
    .update()
    .set({ today_win_count: 0 })
    .execute();
  console.log(' 유저 today_win_count 초기화 완료');
}

}
