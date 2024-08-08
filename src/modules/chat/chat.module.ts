import { Module } from '@nestjs/common';
import { ChatGateway } from './services/chat.gateway';
import { ChatService } from './services/chat.service';
import { AuthModule } from '../auth/auth.module';
import { ChatRepository } from './repository/chat.repository';
import { MessageRepository } from './repository/message.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Messages } from '../../entities/message.entity';
import { Chat } from '../../entities/chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Messages, Chat]), AuthModule],
  providers: [ChatService, ChatGateway, ChatRepository, MessageRepository],
})
export class ChatModule {}
