/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { SplashScreenRepository } from '../repositories/splash-screen.repository';
import {
  CreateSplashScreenInput,
  UpdateSplashScreenInput,
} from '../dto/request/create-splash-screen';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { AppStrings } from '../../../common/messages/app.strings';
import { SuccessResponse } from '../../../common/utils/success.response';
import { StorageService } from '../../file-handler/services/storage.service';
import { LessThanOrEqual, MoreThan } from 'typeorm';
import { SplashScreen } from '../../../entities/splash-screen.entity';
@Injectable()
export class SplashScreenService {
  constructor(
    private readonly splashScreenRepository: SplashScreenRepository,
    private readonly storageService: StorageService,
  ) {}
  logger = new Logger(SplashScreenService.name);
  async create(createSplashScreen: CreateSplashScreenInput) {
    try {
      return await this.splashScreenRepository.save(createSplashScreen);
    } catch (error) {
      this.logger.error(error);
      throw new BadGatewayException(error);
    }
  }

  async findAll(findOption: PaginateAndSort) {
    try {
      const take = findOption.take ?? 20;

      const [splashScreen, total] =
        await this.splashScreenRepository.findAndCount({
          take: Math.min(take, 20),
          skip: findOption.skip ?? 0,
        });
      return { splashScreen, total };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async findOne(id: number) {
    try {
      const splashScreen = await this.splashScreenRepository.findOneByOrFail({
        id,
      });
      if (!splashScreen) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }
      return splashScreen;
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new UnprocessableEntityException(error);
      }
    }
  }

  async update(updateSplashScreenInput: UpdateSplashScreenInput) {
    try {
      const { id, ...rest } = updateSplashScreenInput;
      const splashScreen = await this.splashScreenRepository.findOneByOrFail({
        id,
      });
      if (!splashScreen) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }
      const { affected } = await this.splashScreenRepository.update(id, rest);
      if (affected > 0) {
        return await this.splashScreenRepository.findOneByOrFail({ id });
      }
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new UnprocessableEntityException(error);
      }
    }
  }

  async delete(id: number) {
    try {
      const splashScreen = await this.splashScreenRepository.findOneByOrFail({
        id,
      });
      if (!splashScreen) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }
      const { affected } = await this.splashScreenRepository.softDelete(id);
      if (affected > 0) {
        return new SuccessResponse(AppStrings.DELETED_SUCCESSFULLY);
      }
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new UnprocessableEntityException(error);
      }
    }
  }

  async uploadImage(id: number, file: Express.Multer.File) {
    try {
      const splashScreen = await this.splashScreenRepository.findOneByOrFail({
        id,
      });

      if (!splashScreen) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }
      const url = await this.storageService.upload(file);

      const { affected } = await this.splashScreenRepository.update(
        splashScreen.id,
        {
          image: url,
        },
      );

      if (affected > 0) {
        return await this.splashScreenRepository.findOneByOrFail({ id });
      }
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new UnprocessableEntityException(error);
      }
    }
  }
  async fetchDefault() {
    let splashScreen: SplashScreen;
    try {
      splashScreen = await this.splashScreenRepository.findOneOrFail({
        where: {
          startDate: MoreThan(new Date()),
          endDate: LessThanOrEqual(new Date()),
        },
      });

      if (!splashScreen) {
        splashScreen = await this.splashScreenRepository.findOneOrFail({
          where: {
            default: true,
          },
        });
      }
      return splashScreen;
    } catch (error) {
      this.logger.log(error);
      throw new NotFoundException(AppStrings.NOT_FOUND);
    }
  }
  async searchForSplashScreen(searchParam: string) {
    try {
      return this.splashScreenRepository
        .createQueryBuilder('splashScreen')

        .orWhere('splashScreen.title LIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('splashScreen.placement LIKE :term', {
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
