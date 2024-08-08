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
  async chat(chatInput: CreateMessageInput, user: User) {
    try {
      let chat: Chat;
      const existingChat = await this.chatRepository.findOneBy({
        ticketId: chatInput.ticketId,
      });

      if (!existingChat) {
        chat = await this.chatRepository.save({
          ticketId: chatInput.ticketId,
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
   * findChat
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
   * messages
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

      return await this.messageRepository.findAndCount({
        take: take,
        skip: skip,
        where: {
          chat: { id: chatId },
        },
      });
    } catch (error) {
      this.logger.log(error);
      throw new BadGatewayException(error);
    }
  }
}
