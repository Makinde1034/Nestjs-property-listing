/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ChatRepository } from '../repository/chat.repository';
import { MessageRepository } from '../repository/message.repository';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { CreateMessageInput } from '../dto/request/chat.dto';
import { User } from '../../../entities';
import { Chat } from '../../../entities/chat.entity';
import { ChatFilterInput } from '../dto/request/chat-filter.dto';

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
        if (existingChat?.ticket?.isOpen === false) {
          throw new BadRequestException('Ticket already closed');
        }
        chat = existingChat;
      }
      await this.messageRepository.save({
        chat,
        user,
        message: chatInput.message,
        attachment: chatInput.attachment,
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

  async createMessage(createMessage: CreateMessageInput) {
    try {
      return await this.messageRepository.save(createMessage);
    } catch (error) {
      this.logger.log(error);
      throw new BadGatewayException(error);
    }
  }

  async findMessages(chatFilterInput?: ChatFilterInput) {
    try {
      // Default pagination and sorting options
      const take = chatFilterInput?.take || 20;
      const skip = chatFilterInput?.skip || 0;

      // Fetch messages with related user entity
      const [messages, total] = await this.messageRepository.findAndCount({
        where: {
          chat: { ticketId: chatFilterInput.ticketId },
        },
        relations: ['user'],
        select: {
          id: true,
          message: true,
          attachment: true,
          createdAt: true,
          user: {
            id: true,
            firstName: true,
            lastName: true,
            arabicFirstName: true,
            arabicLastName: true,
            profilePhoto: true,
          },
        },
        take: take,
        skip: skip,
        order: { createdAt: 'DESC' },
      });

      const lastMessage = await this.messageRepository.find({
        where: {
          chat: { ticketId: chatFilterInput.ticketId },
        },
        order: { createdAt: 'DESC' },
        take: 1,
      });

      return { messages, total, lastMessage: lastMessage[0] };
    } catch (error) {
      this.logger.error('Failed to fetch messages', error);
      throw new BadGatewayException('Unable to fetch messages', error.message);
    }
  }
}
