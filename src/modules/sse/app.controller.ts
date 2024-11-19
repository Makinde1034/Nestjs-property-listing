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
  constructor(
    private readonly sseService: SseService,
    private readonly authenticationService: AuthService,
  ) {}

  logger = new Logger();
  @Sse('/notification')
  @Public()
  async sendNotification(
    @Query('userId') userId: string,
    @Query('token') token: string,
    @Res() res: Response,
  ): Promise<Observable<MessageEvent>> {
    if (!token || !userId) {
      throw new BadRequestException('Missing token or userId');
    }

    const user =
      await this.authenticationService.getUserFromAuthenticationToken(token);

    if (!user) {
      this.logger.warn('Authentication failed');
      throw new UnauthorizedException('Authentication failed');
    }

    const clientSubject = new Subject<MessageEvent>();
    this.sseService.addClient(userId, clientSubject);
    res.on('close', () => {
      this.sseService.removeClient(userId);
      clientSubject.complete();
    });
    return clientSubject.asObservable();
  }

  @Sse('/bids')
  @Public()
  async sendBids(
    @Query('userId') userId: string,
    @Query('token') token: string,
    @Query('participantId') participantId: string,
    @Res() res: Response,
  ): Promise<Observable<MessageEvent>> {
    if (!token || !userId) {
      throw new BadRequestException('Missing token or userId');
    }

    const user =
      await this.authenticationService.getUserFromAuthenticationToken(token);

    if (!user) {
      this.logger.warn('Authentication failed');
      throw new UnauthorizedException('Authentication failed');
    }

    const clientSubject = new Subject<MessageEvent>();

    // Add the client with their participantId
    this.sseService.addClient(
      userId,
      clientSubject,
      participantId ?? undefined,
    );

    // Handle connection closure
    res.on('close', () => {
      this.sseService.removeClient(userId);
      clientSubject.complete();
    });

    return clientSubject.asObservable();
  }

  @Sse('/verification')
  @Public()
  async sendEvents(
    @Query('token') token: string,
    @Query('userId') userId: string,
    @Res() res: Response,
  ): Promise<Observable<MessageEvent>> {
    if (!token || !userId) {
      throw new BadRequestException('Missing token or userId');
    }

    const user =
      await this.authenticationService.getUserFromAuthenticationToken(token);

    if (!user) {
      this.logger.warn('Authentication failed');
      throw new UnauthorizedException('Authentication failed');
    }

    const clientSubject = new Subject<MessageEvent>();
    this.sseService.addClient(userId, clientSubject);
    res.on('close', () => {
      this.sseService.removeClient(userId);
      clientSubject.complete();
    });
    return clientSubject.asObservable();
  }
}
