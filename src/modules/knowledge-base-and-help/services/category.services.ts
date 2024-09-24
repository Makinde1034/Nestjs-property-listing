import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { KnowledgeBaseCategoryRepository } from '../repositories/knowledge-base-category.repository';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../dto/knowledg-base.category.input';
import { SuccessResponse } from '../../../common/utils/success.response';
import { AppStrings } from '../../../common/messages/app.strings';

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

  async findAll() {
    try {
      return await this.knowledgeBaseCategoryRepository.find();
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

  async delete(id: number) {
    try {
      const category = await this.knowledgeBaseCategoryRepository.findOneBy({
        id,
      });

      if (!category) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }
      const { affected } =
        await this.knowledgeBaseCategoryRepository.softDelete(id);

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
}
