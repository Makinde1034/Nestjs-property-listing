import {
  Controller,
  Sse,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { Response } from 'express';
import { SseService } from './client.service';
import { MessageEvent } from './request/app';
@Controller('events')
export class AppController {
  constructor(private readonly sseService: SseService) {}

  @Sse('/sse')
  sendEvents(
    @Query('userId') userId: string,
    @Res() res: Response,
  ): Observable<MessageEvent> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
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
