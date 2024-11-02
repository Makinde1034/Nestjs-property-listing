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

@Injectable()
export class KnowledgeBaseCategoryService {
  constructor(
    private readonly knowledgeBaseCategoryRepository: KnowledgeBaseCategoryRepository,
  ) {}

  logger = new Logger(KnowledgeBaseCategoryService.name);
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
      const sortField = findOption.sortField;
      const sortDirection: 'ASC' | 'DESC' = findOption.directionToSort as
        | 'ASC'
        | 'DESC';

      if (findOption.take == undefined && findOption.skip == undefined) {
        findOption.skip = 0;
        findOption.take = 20;
      }

      const orderOptions = {
        [sortField]: sortDirection,
      };
      if (findOption.placement) {
        return await this.knowledgeBaseCategoryRepository.find({
          where: { placement: findOption.placement },
          take: findOption.take,
          skip: findOption.skip,
          order: orderOptions,
        });
      }
      return await this.knowledgeBaseCategoryRepository.find({
        take: findOption.take,
        skip: findOption.skip,
        order: orderOptions,
      });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
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

      if (!category) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }
      const { affected } =
        await this.knowledgeBaseCategoryRepository.softDelete(
          categoryActionInput.id,
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
