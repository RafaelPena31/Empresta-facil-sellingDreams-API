import { ApiProperty } from '@nestjs/swagger';

export class ChatDTO {
  @ApiProperty({ example: 'Once day i will go', description: 'text' })
  readonly text: string;
  @ApiProperty({ description: 'email@hello.com' })
  readonly email: string;
  @ApiProperty({ description: 'sessionId' })
  readonly sessionId: string;
}
