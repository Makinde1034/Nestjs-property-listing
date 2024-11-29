import {
  Controller,
  Sse,
  Query,
  Res,
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { Response } from 'express';
import { SseService } from './client.service';
import { MessageEvent } from './request/app';
import { Public } from '../auth/decorators/permision.decorator';
import { AuthService } from '../auth/services';

@Controller('events')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly sseService: SseService,
    private readonly authenticationService: AuthService,
  ) {}

  @Sse('/notification')
  @Public()
  async sendNotification(
    @Query('userId') userId: string,
    @Query('token') token: string,
    @Res() res: Response,
  ): Promise<Observable<MessageEvent>> {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    return this.setupSse(userId, token, res, 'notification');
  }

  @Sse('/bids')
  @Public()
  async sendBids(
    @Query('userId') userId: string,
    @Query('token') token: string,
    @Query('participantId') participantId: string,
    @Res() res: Response,
  ): Promise<Observable<MessageEvent>> {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    return this.setupSse(userId, token, res, 'bids', participantId);
  }

  @Sse('/verification')
  @Public()
  async sendVerification(
    @Query('userId') userId: string,
    @Query('token') token: string,
    @Res() res: Response,
  ): Promise<Observable<MessageEvent>> {
    return this.setupSse(userId, token, res, 'verification');
  }

  /**
   * Shared logic for setting up SSE streams.
   */
  private async setupSse(
    userId: string,
    token: string,
    res: Response,
    context: string,
    participantId?: string,
  ): Promise<Observable<MessageEvent>> {
    if (!token || !userId) {
      this.logger.warn(`[${context}] Missing token or userId`);
      throw new BadRequestException('Missing token or userId');
    }

    const user =
      await this.authenticationService.getUserFromAuthenticationToken(token);

    if (!user) {
      this.logger.warn(
        `[${context}] Authentication failed for userId: ${userId}`,
      );
      throw new UnauthorizedException('Authentication failed');
    }

    const clientSubject = new Subject<MessageEvent>();

    // Add client to the service with optional participantId
    this.sseService.addClient(userId, clientSubject, participantId);

    // Handle SSE connection closure
    res.on('close', () => {
      this.logger.log(`[${context}] Connection closed for userId: ${userId}`);
      this.sseService.removeClient(userId);
      clientSubject.complete();
    });

    this.logger.log(
      `[${context}] SSE connection established for userId: ${userId}`,
    );
    return clientSubject.asObservable();
  }
}
