import { Body, Controller, Post } from '@nestjs/common';
import { ChatDTO } from './chat.dto';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private service: ChatService) {}

  @Post()
  async chatbot(@Body() chatDto: ChatDTO) {
    const res = await this.service.chat(chatDto);
    return res;
  }
}
