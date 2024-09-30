/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OfferEventHandler {
  logger = new Logger(OfferEventHandler.name);
}
