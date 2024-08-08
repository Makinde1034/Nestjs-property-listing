/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../../auth/services';
import { User } from '../../../entities';
import { CreateMessageInput } from '../dto/request/chat.dto';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(ChatGateway.name);

  constructor(
    private chatService: ChatService,
    private readonly authenticationService: AuthService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      this.logger.log(`Client connected: ${socket.id}`);
      const token = socket.handshake.headers.authorization;
      const chatId = socket.handshake.query.chatId as string;

      if (!token || !chatId) {
        this.logger.warn('Missing token or chatId');
        socket.emit('error', 'Authentication or chatId missing');
        socket.disconnect();
        return;
      }

      const user =
        await this.authenticationService.getUserFromAuthenticationToken(token);

      if (!user) {
        this.logger.warn('Authentication failed');
        socket.emit('error', 'Failed to authenticate user');
        socket.disconnect();
        return;
      }

      // Join the chat room
      socket.join(chatId);
      this.logger.log(`Client ${socket.id} joined room: ${chatId}`);

      // Store user and chatId in socket data if needed
      socket.data.user = user;
      socket.data.chatId = chatId;
    } catch (error) {
      this.logger.error(`Error handling connection: ${error.message}`);
      socket.emit('error', error.message);
      socket.disconnect();
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() content: any,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const messageDto = plainToInstance(CreateMessageInput, content);
      const errors = await validate(messageDto);

      if (errors.length > 0) {
        this.logger.error('Validation failed:', errors);
        socket.emit('error', { message: errors });
        return;
      }

      const user = socket.data.user as User;
      const chatId = socket.data.chatId;

      await this.chatService.chat(content, user);
      this.server.to(chatId).emit('receive_message', {
        content,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          arabicFirstName: user.arabicFirstName,
          arabicLastName: user.arabicLastName,
        },
      });
    } catch (error) {
      this.logger.error(`Error handling message: ${error.message}`);
      socket.emit('error', error.message);
    }
  }

  @SubscribeMessage('fetch_message')
  async handleFetchMessages(
    @MessageBody() content: PaginateAndSort,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const findOptions = plainToInstance(PaginateAndSort, content);
      const errors = await validate(findOptions);

      if (errors.length > 0) {
        this.logger.error('Validation failed:', errors);
        socket.emit('error', { message: errors });
        return;
      }

      const chatId = socket.data.chatId;
      const messages = await this.chatService.findMessages(findOptions, chatId);

      socket.emit('receive_message', messages);
    } catch (error) {
      this.logger.error(`Error handling fetch_message: ${error.message}`);
      socket.emit('error', error.message);
    }
  }
}
