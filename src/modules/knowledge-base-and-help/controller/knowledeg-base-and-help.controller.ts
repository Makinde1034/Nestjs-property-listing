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
  @Post('article')
  @UseGuards(RestAccessTokenGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async uploadImage(
    @Query('articleId') articleId: number,
    @UploadedFiles()
    file: Express.Multer.File,
  ) {
    return await this.articleService.uploadImage(articleId, file);
  }
}
