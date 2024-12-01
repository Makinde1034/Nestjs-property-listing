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
import { KnowledgeBaseCategoryRepository } from '../repositories/knowledge-base-category.repository';
import {
  CategoryActionInput,
  CategoryFilterInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../dto/request/knowledg-base.category.input';
import { SuccessResponse } from '../../../common/utils/success.response';
import { AppStrings } from '../../../common/messages/app.strings';
import { In } from 'typeorm';
import {
  knowledgeBaseMainPlacement,
  knowledgeBaseNeedHelpPlacement,
} from '../../../common/enums/knowledge-base';
import { ArticleRepository } from '../repositories/article.repository';
import { Article } from '../../../entities/article.entity';

@Injectable()
export class KnowledgeBaseCategoryService {
  constructor(
    private readonly knowledgeBaseCategoryRepository: KnowledgeBaseCategoryRepository,
    private readonly articleRepository: ArticleRepository,
  ) {}

  logger = new Logger(KnowledgeBaseCategoryService.name);

  async placement() {
    try {
      const placement = knowledgeBaseMainPlacement;
      const needHelp = knowledgeBaseNeedHelpPlacement;
      const data = JSON.stringify({
        main: placement,
        needHelp: needHelp,
      });

      return data;
    } catch (error) {}
  }
  async createCategory(createCategoryInput: CreateCategoryInput) {
    try {
      return await this.knowledgeBaseCategoryRepository.save(
        createCategoryInput,
      );
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
  async findOne(id: number) {
    try {
      const category = await this.knowledgeBaseCategoryRepository.findOne({
        where: { id },
        relations: ['category'],
      });

      if (!category) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
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
  async findAll(findOption: CategoryFilterInput) {
    try {
      // Set defaults for pagination if not provided
      const take = Math.min(findOption.take ?? 20, 100); // Limit `take` to 100 for performance
      const skip = findOption.skip ?? 0;

      // Validate sort direction and set default
      const validSortDirections = ['ASC', 'DESC'];
      const sortDirection = validSortDirections.includes(
        findOption.directionToSort?.toUpperCase(),
      )
        ? (findOption.directionToSort.toUpperCase() as 'ASC' | 'DESC')
        : 'ASC';

      // Build order options dynamically if sortField is provided
      const orderOptions = findOption.sortField
        ? { [findOption.sortField]: sortDirection }
        : {};

      // Fetch categories and count
      const [category, count] = await this.knowledgeBaseCategoryRepository
        .createQueryBuilder('Category')
        .take(take)
        .skip(skip)
        .orderBy(orderOptions)
        .getManyAndCount();

      return { category, count };
    } catch (error) {
      this.logger.error('Failed to fetch categories', error.stack);

      throw new BadRequestException(
        'Unable to fetch categories. Please try again.',
      );
    }
  }

  async update(updateCategory: UpdateCategoryInput) {
    try {
      const { id, ...rest } = updateCategory;
      const { affected } = await this.knowledgeBaseCategoryRepository.update(
        id,
        rest,
      );

      if (affected > 0) {
        return await this.knowledgeBaseCategoryRepository.findOneBy({ id });
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async delete(categoryActionInput: CategoryActionInput) {
    try {
      const category = await this.knowledgeBaseCategoryRepository.find({
        where: {
          id: In(categoryActionInput.id),
        },
      });

      if (category.length === 0) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }

      const { affected } =
        await this.knowledgeBaseCategoryRepository.softDelete(
          categoryActionInput.id,
        );

      await this.articleRepository
        .createQueryBuilder()
        .update(Article)
        .set({
          published: false,
        })
        .where('categoryId IN (:...ids)', { ids: categoryActionInput.id })
        .execute();

      if (affected > 0) {
        return new SuccessResponse(AppStrings.DELETED_SUCCESSFULLY);
      }
      throw new BadRequestException(AppStrings.NOT_FOUND);
    } catch (error) {
      this.logger.log(error);

      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error);
      }
    }
  }

  async searchForCategory(searchParam: string) {
    try {
      return await this.knowledgeBaseCategoryRepository
        .createQueryBuilder('category')

        .orWhere('category.englishName ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('category.arabicName ILIKE :term', {
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
