/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Controller,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { NotificationService } from '../services';
@Controller('notification-control')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Post('upload-image')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadSplashScreenImage(
    @Query('id') id: string,
    @UploadedFiles() file: Express.Multer.File[],
  ) {
    return await this.notificationService.uploadImage(id, file);
  }
}
