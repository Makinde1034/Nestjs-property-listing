// timeout.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TimeoutMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.setTimeout(200000); // Set timeout in milliseconds
    res.setTimeout(200000);
    next();
  }
}
