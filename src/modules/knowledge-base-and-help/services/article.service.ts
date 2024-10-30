/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ArticleFilterInput,
  ArticlePublishInput,
  CreateArticleInput,
  UpdateArticleInput,
} from '../dto/request/article.input';

import { ArticleRepository } from '../repositories/article.repository';
import { KnowledgeBaseCategoryRepository } from '../repositories/knowledge-base-category.repository';
import { AppStrings } from '../../../common/messages/app.strings';
import { SuccessResponse } from '../../../common/utils/success.response';
import { Article } from '../../../entities/article.entity';
import { DeepPartial, In } from 'typeorm';
import { StorageService } from '../../file-handler/services/storage.service';
import { ActivityLogService } from '../../activity-log/services/activity-log.service';
import { ActivityEnum } from '../../../common/enums/activitys';
import { User } from '../../../entities';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly knowledgeBaseCategoryRepository: KnowledgeBaseCategoryRepository,
    private readonly storageService: StorageService,
    private readonly activityLogService: ActivityLogService,
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
      return await this.articleRepository.save({
        ...createArticleInput,
        category,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.log(error);
        throw new BadRequestException(error);
      }
    }
  }
  async findAll(findOption: ArticleFilterInput) {
    try {
      const {
        placement,
        take: initialTake,
        skip,
        sortField,
        directionToSort,
      } = findOption;
      const orderOptions = {
        [sortField]: directionToSort,
      };

      const take = initialTake <= 20 ? initialTake : 20;
      const [article, total] = await this.articleRepository.findAndCount({
        where: { placement: placement },
        take,
        skip,
        order: orderOptions,
        relations: ['category'],
      });

      return { article, total };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findOne(id: number) {
    try {
      const article = await this.articleRepository.findOne({
        where: { id },
        relations: ['category'],
      });

      if (!article) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }

      return article;
    } catch (error) {
      this.logger.log(error);

      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error);
      }
    }
  }

  async update(updateArticleInput: UpdateArticleInput, user: User) {
    try {
      const { id, ...rest } = updateArticleInput;
      const article = await this.articleRepository.findOneBy({ id });

      if (!article) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }
      const { affected } = await this.articleRepository.update(id, rest);

      if (affected > 0) {
        await this.activityLogService.logActivity([
          {
            adminId: user.id,
            action: ActivityEnum.UPDATED,
            articleId: article.id,
          },
        ]);
        return await this.articleRepository.findOneBy({ id });
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async publish(articlePublishInput: ArticlePublishInput) {
    try {
      const { id } = articlePublishInput;
      const articleToUpdate: DeepPartial<Article>[] = [];
      const notFoundIds: number[] = [];

      const articles = await this.articleRepository.find({
        where: { id: In(id) },
      });

      if (articles.length < id.length) {
        const foundUserIds = articles.map((article) => article.id);
        notFoundIds.push(
          ...id.filter((value) => !foundUserIds.includes(value)),
        );
      }

      articles.forEach((article) => {
        articleToUpdate.push({ id: article.id, published: true });
      });

      const updatedArticle = await this.articleRepository.save(articleToUpdate);

      return new SuccessResponse(
        `You have successfully published the selected article`,
        {
          successful: updatedArticle,
          failed: notFoundIds,
        },
      );
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async unpublish(articlePublishInput: ArticlePublishInput) {
    try {
      const { id } = articlePublishInput;
      const articleToUpdate: DeepPartial<Article>[] = [];
      const notFoundIds: number[] = [];

      const article = await this.articleRepository.find({
        where: { id: In(id) },
      });

      if (article.length < id.length) {
        const foundUserIds = article.map((element) => element.id);
        notFoundIds.push(
          ...id.filter((value) => !foundUserIds.includes(value)),
        );
      }

      article.forEach((element) => {
        articleToUpdate.push({ id: element.id, published: false });
      });

      const updatedArticle = await this.articleRepository.save(articleToUpdate);

      return new SuccessResponse(
        `You have successfully unpublished the selected article`,
        {
          successful: updatedArticle,
          failed: notFoundIds,
        },
      );
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async remove(id: number) {
    try {
      const category = await this.articleRepository.findOneBy({
        id,
      });

      if (!category) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }
      const { affected } = await this.articleRepository.softDelete(id);

      if (affected > 0) {
        return new SuccessResponse(AppStrings.DELETED_SUCCESSFULLY);
      }
    } catch (error) {
      this.logger.log(error);

      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error);
      }
    }
  }

  async uploadImage(id: number, file: Express.Multer.File) {
    try {
      const article = await this.articleRepository.findOne({ where: { id } });

      if (!article) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }

      const url = await this.storageService.upload(file);

      await this.articleRepository.update(id, { image: url });

      return new SuccessResponse(AppStrings.UPLOAD_SUCCESSFUL, url);
    } catch (error) {
      this.logger.error('Error during image upload', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(
          error.message || 'An unexpected error occurred during image upload',
        );
      }
    }
  }

  async searchForArticles(searchParam: string) {
    try {
      return await this.articleRepository
        .createQueryBuilder('article')
        .leftJoinAndSelect('author.user', 'user')
        .orWhere('article.title LIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('article.placement LIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('article.title LIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('user.firstName LIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('user.arabicFirstName LIKE :term', {
          term: `%${searchParam}%`,
        })
        .take(10)
        .getMany();
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
}
