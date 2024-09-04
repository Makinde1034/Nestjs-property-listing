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
import { StorageService } from '../../file-handler/services/storage.service';
import { Readable } from 'stream';

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
    private storageService: StorageService,
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

  // @SubscribeMessage('send_message')
  // Async handleMessage(
  //   @MessageBody() content: any,
  //   @ConnectedSocket() socket: Socket,
  // ) {
  //   Try {
  //     This.logger.log(content, 'Chat service executed successfully');
  //     This.logger.log(`Received message content: ${JSON.stringify(content)}`);

  //     Const messageDto = plainToInstance(CreateMessageInput, {
  //       Message: content,
  //     });
  //     Const errors = await validate(messageDto);

  //     If (errors.length > 0) {
  //       This.logger.error('Validation failed:', errors);
  //       Socket.emit('error', { message: errors });
  //       Return;
  //     }
  //     This.logger.log('Chat service executed successfully');

  //     Const user = socket.data.user as User;
  //     Const ticketId = socket.data.ticketId;

  //     This.logger.log(`User: ${JSON.stringify(user)}, Ticket ID: ${ticketId}`);

  //     Await this.chatService.chat(content, ticketId, user);
  //     This.logger.log('Chat service executed successfully');

  //     This.server.to(ticketId).emit('receive_message', {
  //       Content,
  //       User: {
  //         Id: user.id,
  //         FirstName: user.firstName,
  //         LastName: user.lastName,
  //         ArabicFirstName: user.arabicFirstName,
  //         ArabicLastName: user.arabicLastName,
  //       },
  //     });

  //     This.logger.log(`Message emitted to room: ${ticketId}`);
  //   } catch (error) {
  //     This.logger.error(`Error handling message: ${error.message}`);
  //     Socket.emit('error', error.message);
  //   }
  // }

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

  @SubscribeMessage('send_message')
  async handleFileUpload(
    @MessageBody() content: any,
    @ConnectedSocket() socket: Socket,
    @MessageBody('file') file?: Buffer,
  ) {
    const user = socket.data.user as User;
    const ticketId = socket.data.ticketId;

    this.logger.log(content, 'Chat service executed successfully');
    this.logger.log(`Received message content: ${JSON.stringify(content)}`);

    // Helper function to create Express.Multer.File-like object
    function createMulterFile(
      buffer: Buffer,
      originalname: string,
      mimetype: string,
    ): Express.Multer.File {
      const multerFile: Express.Multer.File = {
        fieldname: 'file', // Name of the form field associated with the file
        originalname, // The original name of the uploaded file
        encoding: '7bit', // Encoding type (e.g., 7bit, utf8); default is '7bit'
        mimetype, // The MIME type of the file (e.g., image/jpeg, image/png)
        buffer, // The file's buffer content
        size: buffer.length, // The size of the file in bytes
        stream: Readable.from(buffer), // Create a readable stream from the buffer
        destination: '', // Optional: file destination path on disk
        filename: originalname, // Optional: file name in the destination
        path: '', // Optional: full path to the file on disk
      };

      return multerFile;
    }

    let multerFile: Express.Multer.File | undefined = undefined;

    if (file) {
      try {
        const fileBuffer = Buffer.from(content.file, 'base64');
        multerFile = createMulterFile(
          fileBuffer,
          `${ticketId}.jpg`,
          'image/jpeg',
        );
      } catch (error) {
        this.logger.error('Failed to create file buffer:', error);
        socket.emit('error', { message: 'Failed to process file' });
        return;
      }
    }

    let result;
    if (multerFile) {
      try {
        result = await this.storageService.upload(multerFile);
      } catch (error) {
        this.logger.error('File upload failed:', error);
        socket.emit('error', { message: 'File upload failed' });
        return;
      }
    }

    const message: CreateMessageInput = {
      message: content.message,
      attachment: result, // Attach result if available
    };

    const messageDto = plainToInstance(CreateMessageInput, message);
    const errors = await validate(messageDto);

    if (errors.length > 0) {
      this.logger.error('Validation failed:', errors);
      socket.emit('error', { message: errors });
      return;
    }

    this.logger.log('Chat service executed successfully');
    this.logger.log(`User: ${JSON.stringify(user)}, Ticket ID: ${ticketId}`);

    try {
      await this.chatService.chat(message, ticketId, user);
    } catch (error) {
      this.logger.error('Failed to send chat message:', error);
      socket.emit('error', { message: 'Failed to send chat message' });
      return;
    }

    this.server.to(ticketId).emit('receive_message', {
      message,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        arabicFirstName: user.arabicFirstName,
        arabicLastName: user.arabicLastName,
      },
    });

    this.logger.log(`Message emitted to room: ${ticketId}`);
  }
}
