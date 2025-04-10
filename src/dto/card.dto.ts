import { IsString,IsInt } from 'class-validator';
export class UpgradeCardDto {
    userId: string;
    cardId: number;
  }
  export class AcquireCardDto {
    @IsString()
    userId: string;  // 유저 ID
  
    @IsInt()
    cardId: number;  // 카드 ID
  }