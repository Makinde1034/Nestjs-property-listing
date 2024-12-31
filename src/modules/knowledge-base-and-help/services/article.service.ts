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
      const { metadata } = createArticleInput;
      const category = await this.knowledgeBaseCategoryRepository.findOneBy({
        id: createArticleInput.categoryId,
      });
      if (!category) {
        throw new NotFoundException('category not found');
      }
      const stringifiedMetadata = JSON.stringify(metadata);
      return await this.articleRepository.save({
        ...createArticleInput,
        metadata: stringifiedMetadata,
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
        skip = 0,
        sortField = 'createdAt', // Default sort field
        directionToSort = 'DESC', // Default sort direction
        published,
        categoryId,
        placement,
        where,
        language,
      } = findOption;

      // Limit `take` to a maximum of 20
      const take = initialTake && initialTake <= 20 ? initialTake : 20;

      // Initialize query builder
      const queryBuilder = this.articleRepository.createQueryBuilder('article');

      // Ensure `placement` is not NULL
      queryBuilder.where('article.placement IS NOT NULL');

      // Apply `where` condition dynamically
      if (where?.fieldToChose && where?.whereParam) {
        queryBuilder.andWhere(
          `article.${where.fieldToChose} IS ${where.whereParam}`,
        );
      }

      // Apply additional filters
      if (language) {
        queryBuilder.andWhere('article.language = :language', { language });
      }

      if (published !== undefined) {
        queryBuilder.andWhere('article.published = :published', { published });
      }

      if (placement !== undefined) {
        queryBuilder.andWhere('article.placement = :placement', { placement });
      }

      if (categoryId) {
        queryBuilder.andWhere('article.categoryId = :categoryId', {
          categoryId,
        });
      }

      // Apply sorting
      queryBuilder.orderBy(
        `article.${sortField}`,
        directionToSort as 'ASC' | 'DESC',
      );

      // Apply pagination
      queryBuilder.take(take).skip(skip);

      // Join related entities
      queryBuilder
        .leftJoinAndSelect('article.category', 'category')
        .leftJoinAndSelect('article.user', 'user');

      // Execute the query and fetch results
      const [article, total] = await queryBuilder.getManyAndCount();

      return { article, total };
    } catch (error) {
      this.logger.error('Error fetching articles', { error, findOption });
      throw new BadRequestException('Error fetching articles');
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
      const { id, metadata, categoryId, ...rest } = updateArticleInput;
      let stringifiedMetadata;
      const article = await this.articleRepository.findOne({
        where: { id },
        relations: ['category'],
      });

      if (!article) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }

      // Update metadata if provided
      if (metadata) {
        stringifiedMetadata = JSON.stringify(metadata);
        article.metadata = stringifiedMetadata;
      }

      // Update category relation if categoryId is provided
      if (categoryId) {
        const category = await this.knowledgeBaseCategoryRepository.findOneBy({
          id: categoryId,
        });
        if (!category) {
          throw new NotFoundException('Category not found');
        }
        article.category = category;
      }

      // Apply other updates
      Object.assign(article, rest);

      // Save updated article
      const updatedArticle = await this.articleRepository.save(article);

      // Log activity
      await this.activityLogService.logActivity([
        {
          adminId: user.id,
          action: ActivityEnum.UPDATED,
          articleId: article.id,
          details: JSON.stringify(updatedArticle),
        },
      ]);

      return updatedArticle;
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
        .leftJoinAndSelect('article.user', 'user')
        .where('article.placement IS NOT NULL')
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

  async searchForArticlesKnowledgeBase(searchParam: string) {
    try {
      return await this.articleRepository
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.user', 'user')
        .leftJoinAndSelect('article.category', 'category')

        .where('article.placement IS NULL')
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
