/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Global, Module } from '@nestjs/common';
import { SseService } from './client.service';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  providers: [SseService],
  exports: [SseService],
})
export class SseModule {}
