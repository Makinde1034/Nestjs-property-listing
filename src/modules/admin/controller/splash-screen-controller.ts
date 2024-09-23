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
import { SplashScreenService } from '../services/splash-screen.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
@Controller('splash-screen')
export class SplashScreenController {
  constructor(private readonly splashScreenService: SplashScreenService) {}
  @Post('upload-image')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadSplashScreenImage(
    @Query('id') id: number,
    @UploadedFiles() file: Express.Multer.File,
  ) {
    return await this.splashScreenService.uploadImage(id, file);
  }
}
