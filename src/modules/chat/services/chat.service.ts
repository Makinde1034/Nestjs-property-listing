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

  async findMessages(findOption?: PaginateAndSort, ticketId?: string) {
    try {
      // Default pagination and sorting options
      const take = findOption?.take || 20;
      const skip = findOption?.skip || 0;

      // Fetch messages with related user entity
      const messages = await this.messageRepository.find({
        where: {
          chat: { ticketId: ticketId },
        },
        relations: ['user'],
        select: {
          id: true,
          message: true,
          createdAt: true,
          user: {
            id: true,
            firstName: true,
            lastName: true,
            arabicFirstName: true,
            arabicLastName: true,
          },
        },
        take: take,
        skip: skip,
        order: { createdAt: 'DESC' },
      });

      // Transform the message data with a null check for user
      const transformedMessages = messages.map((msg) => ({
        id: msg.id,
        message: msg.message,
        createdAt: msg.createdAt,
        user: msg.user
          ? {
              id: msg.user.id,
              firstName: msg.user.firstName,
              lastName: msg.user.lastName,
              arabicFirstName: msg.user.arabicFirstName,
              arabicLastName: msg.user.arabicLastName,
            }
          : null, // Handle null user case
      }));

      // Return transformed message data
      return transformedMessages;
    } catch (error) {
      // Improved error logging
      this.logger.error('Failed to fetch messages', error);
      throw new BadGatewayException('Unable to fetch messages', error.message);
    }
  }
}
