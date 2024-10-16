/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { UseGuards } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { ChatFilterInput } from '../dto/request/chat-filter.dto';
import { MessageResponse } from '../dto/response/message-response';
import { AccessTokenGuard } from '../../auth/guards';
import { Public } from '../../auth/decorators/permision.decorator';

@Resolver()
export class ChatResolver {
  constructor(private chatService: ChatService) {}
  @UseGuards(AccessTokenGuard)
  @Public()
  @Query(() => MessageResponse)
  async getChat(
    @Args('chatFilterInput') chatFilterInput: ChatFilterInput,
  ): Promise<MessageResponse> {
    return await this.chatService.findMessages(chatFilterInput);
  }
}
