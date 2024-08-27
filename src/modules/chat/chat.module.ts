/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { ChatGateway } from './services/chat.gateway';
import { ChatService } from './services/chat.service';
import { AuthModule } from '../auth/auth.module';
import { ChatRepository } from './repository/chat.repository';
import { MessageRepository } from './repository/message.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Messages } from '../../entities/message.entity';
import { Chat } from '../../entities/chat.entity';
import { ChatResolver } from './resolver/chat.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Messages, Chat]), AuthModule],
  providers: [
    ChatService,
    ChatGateway,
    ChatRepository,
    MessageRepository,
    ChatResolver,
  ],
})
export class ChatModule {}
