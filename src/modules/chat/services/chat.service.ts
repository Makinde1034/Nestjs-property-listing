/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ChatRepository } from '../repository/chat.repository';
import { MessageRepository } from '../repository/message.repository';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { CreateMessageInput } from '../dto/request/chat.dto';
import { User } from '../../../entities';
import { Chat } from '../../../entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private messageRepository: MessageRepository,
  ) {}

  logger = new Logger(ChatService.name);
  async chat(chatInput: CreateMessageInput, ticketId: string, user: User) {
    try {
      let chat: Chat;
      const existingChat = await this.chatRepository.findOneBy({
        ticketId: ticketId,
      });

      if (!existingChat) {
        chat = await this.chatRepository.save({
          ticketId: ticketId,
          user,
        });
      } else {
        chat = existingChat;
      }
      await this.messageRepository.save({
        chat,
        user,
        message: chatInput.message,
      });
      return chat;
    } catch (error) {
      this.logger.log(error);
      throw new BadGatewayException(error);
    }
  }

  /********************************
   * FindChat
   ********************************/

  async findAllChat(findOptions: PaginateAndSort) {
    try {
      let take: number;
      let skip: number;

      if (findOptions.take == null) {
        take = 20;
        skip = 0;
      } else {
        take = findOptions.take;
        skip = findOptions.skip;
      }

      return await this.chatRepository.findAndCount({
        take,
        skip,
        relations: ['message'],
      });
    } catch (error) {
      this.logger.log(error);
      throw new BadGatewayException(error);
    }
  }

  async findOneChat(id: string) {
    try {
      return await this.chatRepository.findOneByOrFail({ id: id });
    } catch (error) {
      this.logger.log(error);
      throw new BadGatewayException(error);
    }
  }

  /***********************************
   * Messages
   *
   ***********************************/

  async createMessage(createMessage) {
    try {
      return await this.messageRepository.save(createMessage);
    } catch (error) {
      this.logger.log(error);
      throw new BadGatewayException(error);
    }
  }

  async findMessages(findOption?: PaginateAndSort, chatId?: string) {
    try {
      let take: number;
      let skip: number;

      if (findOption == null) {
        take = 20;
        skip = 0;
      } else {
        take = findOption.take;
        skip = findOption.skip;
      }

      const [messages, count] = await this.messageRepository.findAndCount({
        where: {
          chat: { id: chatId },
        },
        relations: ['user'],
        select: {
          id: true,
          message: true,
          createdAt: true,
        },
        take: take,
        skip: skip,
      });

      const transformedMessages = messages.map((message) => ({
        id: message.id,
        message: message.message,
        createdAt: message.createdAt,
        user: {
          id: message.user.id,
          firstName: message.user.firstName,
          lastName: message.user.lastName,
          arabicFirstName: message.user.arabicFirstName,
          arabicLastName: message.user.arabicLastName,
        },
      }));

      return { messages: transformedMessages, count };
    } catch (error) {
      this.logger.log(error);
      throw new BadGatewayException(error);
    }
  }
}
