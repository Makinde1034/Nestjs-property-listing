/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction, response } from 'express';
import { UserTrackingService } from '../../modules/user/services/user.tracking.service';
import { LocationService } from '../../modules/location/services';

import * as jwt from 'jsonwebtoken';

import * as requestIp from 'request-ip';

// async use(req: Request, res: Response, next: NextFunction) {

//     next();
// }

@Injectable()
export class TrackingMiddleware implements NestMiddleware {
  constructor(
    private readonly userTrackingService: UserTrackingService,
    private readonly locationService: LocationService,
  ) {}
  // async use(req: Request, res: Response, next: NextFunction) {
  //   let type;

  //   const pageVisited = req.originalUrl;
  //   const ipAddress = req.ip;
  //   const userAgent = req.headers['user-agent'];
  //   if (req.isAuthenticated) {
  //     type = 'user';

  //     await this.locationService.updateUserCity(req.user['id'], ipAddress);
  //   } else {
  //     type = 'guest';
  //   }

  //   await this.userTrackingService.trackVisit(
  //     null,
  //     pageVisited,
  //     ipAddress,
  //     userAgent,
  //     type,
  //   );

  //   next();
  // }

  async use(req: Request, res: Response, next: NextFunction) {
    let type;
    const pageVisited = req.originalUrl;

    const clientIp = requestIp.getClientIp(req) || req.socket.remoteAddress; // Correct IP extraction
    const userAgent = req.headers['user-agent'];

    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    let userId = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        userId = decoded.sub.userId;
        type = 'user';

        if (userId) {
          await this.locationService.updateUserCity(userId, clientIp);
        }
      } catch (error) {
        console.warn('Invalid token:', error.message);
        type = 'guest';
      }
    } else {
      type = 'guest';
    }

    await this.userTrackingService.trackVisit(
      userId,
      pageVisited,
      clientIp,
      userAgent,
      type,
    );

    next();
  }
}
