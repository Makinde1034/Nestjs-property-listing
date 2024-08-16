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
      const ticketId = socket.handshake.query.ticketId as string;

      if (!token || !ticketId) {
        this.logger.warn('Missing token or ticketId');
        socket.emit('error', 'Authentication or ticketId missing');
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
      socket.join(ticketId);
      this.logger.log(`Client ${socket.id} joined room: ${ticketId}`);

      // Store user and ticketId in socket data
      socket.data.user = user;
      socket.data.ticketId = ticketId;
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
      this.logger.log(content, 'Chat service executed successfully');
      this.logger.log(`Received message content: ${JSON.stringify(content)}`);

      const messageDto = plainToInstance(CreateMessageInput, content);
      const errors = await validate(messageDto);

      if (errors.length > 0) {
        this.logger.error('Validation failed:', errors);
        socket.emit('error', { message: errors });
        return;
      }
      this.logger.log('Chat service executed successfully');

      const user = socket.data.user as User;
      const ticketId = socket.data.ticketId;

      this.logger.log(`User: ${JSON.stringify(user)}, Ticket ID: ${ticketId}`);

      await this.chatService.chat(content, ticketId, user);
      this.logger.log('Chat service executed successfully');

      this.server.to(ticketId).emit('receive_message', {
        content,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          arabicFirstName: user.arabicFirstName,
          arabicLastName: user.arabicLastName,
        },
      });

      this.logger.log(`Message emitted to room: ${ticketId}`);
    } catch (error) {
      this.logger.error(`Error handling message: ${error.message}`);
      socket.emit('error', error.message);
    }
  }

  @SubscribeMessage('fetch_message')
  async handleFetchMessages(
    @ConnectedSocket() socket: Socket,
    // @MessageBody() content?: PaginateAndSort,
  ) {
    try {
      //Uncomment to enable and add  class validation to paginateAndSort
      // Const findOptions = plainToInstance(PaginateAndSort, content);
      // Const errors = await validate(findOptions);
      // If (errors.length > 0) {
      //   This.logger.error('Validation failed:', errors);
      //   Socket.emit('error', { message: errors });
      //   Return;
      // }

      const ticketId = socket.data.ticketId;
      this.logger.log(`Fetching messages for room: ${ticketId}`);

      const messages = await this.chatService.findMessages(
        // FindOptions,
        ticketId,
      );

      socket.emit('fetch_message', messages);
      this.logger.log(`Messages sent to client for room: ${ticketId}`);
    } catch (error) {
      this.logger.error(`Error handling fetch_message: ${error.message}`);
      socket.emit('error', error.message);
    }
  }
}
