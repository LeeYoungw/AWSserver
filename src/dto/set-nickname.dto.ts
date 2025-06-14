// src/users/dto/set-nickname.dto.ts
import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetNicknameDto {
  @ApiProperty({ example: '강한닉네임', description: '설정할 닉네임 (2~20자)' })
  @IsString()
  @Length(2, 20)
  nickname: string;
}
