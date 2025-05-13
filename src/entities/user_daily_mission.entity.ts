import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User} from './user.entity';
import { DailyMission } from './daily_mission.entity';

@Entity('user_daily_mission')
export class UserDailyMission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.dailyMissions, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => DailyMission, { onDelete: 'CASCADE' })
  mission: DailyMission;

  @Column({ default: false })
  is_completed: boolean;

  @Column({ default: false })
  is_claimed: boolean;

  @Column({ type: 'date' })
  date: Date; // 매일 초기화를 위한 날짜 키
}
