/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Controller,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ArticleService } from '../services/article.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { RestAccessTokenGuard } from '../../auth/guards';

@Controller('knowledge-base')
export class KnowledgeBaseAndHelpController {
  constructor(private articleService: ArticleService) {}
  @Post('feature-image-upload')
  @UseGuards(RestAccessTokenGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async uploadImage(
    @Query('articleId') articleId: number,
    @UploadedFiles()
    file: Express.Multer.File[],
  ) {
    return await this.articleService.uploadImage(articleId, file);
  }

  @Post('profile-image-upload')
  @UseGuards(RestAccessTokenGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async uploadProfileImage(
    @Query('articleId') articleId: number,
    @UploadedFiles()
    file: Express.Multer.File[],
  ) {
    return await this.articleService.uploadProfileImage(articleId, file);
  }
}
