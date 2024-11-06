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
  ArticleDeleteInput,
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
  async create(createArticleInput: CreateArticleInput, user: User) {
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
        user,
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

  async findAllKnowledgeBase(findOption: ArticleFilterInput) {
    try {
      const {
        take: initialTake,
        skip,
        sortField,
        directionToSort,
        published,
        categoryId,
      } = findOption;

      // Set default pagination and limit `take` to 20
      const take = initialTake && initialTake <= 20 ? initialTake : 20;

      // Initialize query builder for articles
      const queryBuilder = this.articleRepository.createQueryBuilder('article');

      // Enforce `placement` to be NULL
      queryBuilder.where('article.placement IS NULL');

      // Add additional filtering conditions
      if (published !== undefined) {
        queryBuilder.andWhere('article.published = :published', { published });
      }
      if (categoryId) {
        queryBuilder.andWhere('article.categoryId = :categoryId', {
          categoryId,
        });
      }

      // Apply sorting if `sortField` and `directionToSort` are provided
      if (sortField && directionToSort) {
        queryBuilder.orderBy(
          `article.${sortField}`,
          directionToSort as 'ASC' | 'DESC',
        );
      }

      // Apply pagination
      queryBuilder.take(take).skip(skip);

      // Join related entities
      queryBuilder
        .leftJoinAndSelect('article.category', 'category')
        .leftJoinAndSelect('article.user', 'user');

      // Execute the query and get results with the total count
      const [article, total] = await queryBuilder.getManyAndCount();

      return { article, total };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAll(findOption: ArticleFilterInput) {
    try {
      const {
        take: initialTake,
        skip,
        sortField,
        directionToSort,
        published,
        categoryId,
      } = findOption;

      // Set default pagination and limit `take` to 20
      const take = initialTake && initialTake <= 20 ? initialTake : 20;

      // Initialize query builder for articles
      const queryBuilder = this.articleRepository.createQueryBuilder('article');

      // Enforce `placement` to not be NULL
      queryBuilder.where('article.placement IS NOT NULL');

      // Add additional filtering conditions
      if (published !== undefined) {
        queryBuilder.andWhere('article.published = :published', { published });
      }
      if (categoryId) {
        queryBuilder.andWhere('article.categoryId = :categoryId', {
          categoryId,
        });
      }

      // Apply sorting if `sortField` and `directionToSort` are provided
      if (sortField && directionToSort) {
        queryBuilder.orderBy(
          `article.${sortField}`,
          directionToSort as 'ASC' | 'DESC',
        );
      } else {
        queryBuilder.orderBy('article.createdAt', 'DESC'); // Example default sort
      }

      // Apply pagination
      queryBuilder.take(take).skip(skip);

      // Join related entities
      queryBuilder
        .leftJoinAndSelect('article.category', 'category')
        .leftJoinAndSelect('article.user', 'user');

      // Execute the query and get results with the total count
      const [article, total] = await queryBuilder.getManyAndCount();

      return { article, total };
    } catch (error) {
      this.logger.error({ error, findOption }); // Log additional context if needed
      throw new BadRequestException(error);
    }
  }

  async findOne(id: number) {
    try {
      const article = await this.articleRepository.findOne({
        where: { id },
        relations: ['category', 'user'],
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

  async remove(articleDeleteInput: ArticleDeleteInput) {
    try {
      const category = await this.articleRepository.find({
        where: {
          id: In(articleDeleteInput.id),
        },
      });

      if (!category) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }
      const { affected } = await this.articleRepository.softDelete(
        articleDeleteInput.id,
      );

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

  async uploadImage(id: number, file: Express.Multer.File[]) {
    try {
      const article = await this.articleRepository.findOne({ where: { id } });

      if (!article) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }

      const url = await this.storageService.upload(file[0]);

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

  async uploadProfileImage(id: number, file: Express.Multer.File[]) {
    try {
      const article = await this.articleRepository.findOne({
        where: { id: id },
      });

      if (!article) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }

      const url = await this.storageService.upload(file[0]);

      await this.articleRepository.update(id, { authorImage: url });

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
        .orWhere('article.title ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('article.placement ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('article.title ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('user.firstName ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('user.arabicFirstName ILIKE :term', {
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
