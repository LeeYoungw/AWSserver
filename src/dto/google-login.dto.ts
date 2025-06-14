// google-login.dto.ts (생성)
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIn0...', description: 'Google에서 받은 ID Token' })
  idToken: string;
}
