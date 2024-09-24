import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleInput } from '../dto/request/article.input';

import { ArticleRepository } from '../repositories/article.repository';
import { KnowledgeBaseCategoryRepository } from '../repositories/knowledge-base-category.repository';
import { AppStrings } from '../../../common/messages/app.strings';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly knowledgeBaseCategoryRepository: KnowledgeBaseCategoryRepository,
  ) {}
  logger = new Logger(ArticleService.name);
  async create(createArticleInput: CreateArticleInput) {
    try {
      const category = await this.knowledgeBaseCategoryRepository.findOneBy({
        id: createArticleInput.categoryId,
      });

      if (!category) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }
      return await this.articleRepository.save(createArticleInput);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.log(error);
        throw new BadRequestException(error);
      }
    }
  }

  async findAll(findOption) {
    return await this.articleRepository.findAndCount();
  }

  findOne(id: number) {
    return `This action returns a #${id} knowledgeBaseAndHelp`;
  }

  update(id: number) {
    return `This action updates a #${id} knowledgeBaseAndHelp`;
  }

  remove(id: number) {
    return `This action removes a #${id} knowledgeBaseAndHelp`;
  }
}
