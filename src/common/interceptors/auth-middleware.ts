/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as passport from 'passport';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (user) {
        req.user = user;
      }
      next();
    })(req, res, next);
  }
}
