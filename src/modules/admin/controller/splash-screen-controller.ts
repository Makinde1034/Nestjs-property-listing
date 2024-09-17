/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Controller, Post, Query, UploadedFile } from '@nestjs/common';
import { SplashScreenService } from '../services/splash-screen.service';
@Controller('splash-screen')
export class SplashScreenController {
  constructor(private readonly splashScreenService: SplashScreenService) {}
  @Post('upload-image')
  async uploadSplashScreenImage(
    @Query('id') id: string,
    @UploadedFile('file') file: Express.Multer.File,
  ) {
    return await this.splashScreenService.uploadImage(id, file);
  }
}
