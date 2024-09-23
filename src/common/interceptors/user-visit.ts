/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserTrackingService } from '../../modules/user/services/user.tracking.service';

@Injectable()
export class TrackingMiddleware implements NestMiddleware {
  constructor(private readonly userTrackingService: UserTrackingService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let type;
    if (req.isAuthenticated) {
      type = 'user';
    } else {
      type = 'guest';
    }
    const pageVisited = req.originalUrl;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    await this.userTrackingService.trackVisit(
      null,
      pageVisited,
      ipAddress,
      userAgent,
      type,
    );

    next();
  }
}
