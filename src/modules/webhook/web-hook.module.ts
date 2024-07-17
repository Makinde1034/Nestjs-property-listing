/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { WebHookController } from './web-hook.controller';

@Module({
  controllers: [WebHookController],
})
export class WebHookModule {}
