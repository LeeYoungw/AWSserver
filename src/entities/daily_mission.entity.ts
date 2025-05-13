import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('daily_mission')
export class DailyMission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string; // 예: '출석 보상', '전투에서 승리하기'

  @Column()
  reward_type: string; // gold, exp, diamond 등

  @Column()
  reward_amount: number;

  @Column()
  mission_type: string; // ATTENDANCE, BATTLE_WIN, BATTLE_WIN_X2 등

  @Column({ default: false })
  is_streak_based: boolean; // 7일 연속 출석 여부에 사용
}