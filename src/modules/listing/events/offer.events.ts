import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OfferEventHandler {
  logger = new Logger(OfferEventHandler.name);
}
