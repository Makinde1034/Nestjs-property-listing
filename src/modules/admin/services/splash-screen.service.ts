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
import { AppStrings } from '../../../common/messages/app.strings';
import { SuccessResponse } from '../../../common/utils/success.response';
import { StorageService } from '../../file-handler/services/storage.service';
import { Between, In, LessThanOrEqual, MoreThan } from 'typeorm';
import { SplashScreen } from '../../../entities/splash-screen.entity';
import { User } from '../../../entities';
import { ActivityLogService } from '../../activity-log/services/activity-log.service';
import { ActivityEnum } from '../../../common/enums/activitys';
import {
  DeleteSplashScreenInput,
  SplashScreenFilterInput,
} from '../dto/request/admin-request';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { AdminWorkflowService } from './admin-workflow.service';
import { ActionService } from './action.service';
@Injectable()
export class SplashScreenService {
  constructor(
    private readonly splashScreenRepository: SplashScreenRepository,
    private readonly storageService: StorageService,
    private readonly activityLogService: ActivityLogService,
    private readonly workflowService: AdminWorkflowService,
    private readonly actionService: ActionService,
  ) {}
  logger = new Logger(SplashScreenService.name);
  async create(createSplashScreen: CreateSplashScreenInput, admin: User) {
    try {
      const documentName = this.splashScreenRepository.metadata.name;

      // Check for workflow configuration
      const actionConfigPromise =
        this.workflowService.findOneWorkflowByDocumentname(documentName);

      // Prepare splash screen instance
      const splashScreen =
        this.splashScreenRepository.create(createSplashScreen);

      // Await workflow configuration result
      const actionConfig = await actionConfigPromise;

      if (actionConfig) {
        // Offload action request creation to avoid blocking save operation
        this.actionService
          .createActionRequest(
            {
              document: documentName,
              actionType: 'create',
              targetEntityId: null,
              user: admin,
              payload: JSON.stringify(splashScreen),
            },
            admin,
          )
          .catch((err) =>
            this.logger.error('Action Request Creation Failed', err),
          );

        return new SuccessResponse('Awaiting action Approval');
      }

      // Save the splash screen directly if no workflow exists
      const savedSplashScreen =
        await this.splashScreenRepository.save(createSplashScreen);

      // Log activity asynchronously
      this.activityLogService
        .logActivity([
          {
            adminId: admin.id,
            action: ActivityEnum.CREATED,
            details: JSON.stringify(savedSplashScreen),
            splashScreenId: savedSplashScreen.id,
          },
        ])
        .catch((err) => this.logger.error('Activity Logging Failed', err));

      return new SuccessResponse(AppStrings.SUCCESSFULL, savedSplashScreen);
    } catch (error) {
      this.logger.error(
        'Error during splash screen creation',
        error.message || error,
      );
      throw new BadGatewayException('Failed to create splash screen');
    }
  }

  async findAll(findOption: SplashScreenFilterInput) {
    try {
      const now = new Date();
      const whereCondition: any = {};
      const dateField = 'createdAt';
      switch (findOption.timePeriod) {
        case 'today':
          whereCondition[dateField] = Between(startOfDay(now), endOfDay(now));
          break;
        case 'week':
          whereCondition[dateField] = Between(startOfWeek(now), endOfWeek(now));
          break;
        case 'month':
          whereCondition[dateField] = Between(
            startOfMonth(now),
            endOfMonth(now),
          );
          break;
        case 'year':
          whereCondition[dateField] = Between(startOfYear(now), endOfYear(now));
          break;
      }
      const take = findOption.take ?? 20;
      const [splashScreen, total] =
        await this.splashScreenRepository.findAndCount({
          where: whereCondition,
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

  async update(updateSplashScreenInput: UpdateSplashScreenInput, admin: User) {
    try {
      const { id, ...rest } = updateSplashScreenInput;

      const [splashScreen, actionConfig] = await Promise.all([
        this.splashScreenRepository.findOneBy({
          id,
        }),

        this.workflowService.findOneWorkflowByDocumentname(
          this.splashScreenRepository.metadata.name,
        ),
      ]);

      if (!splashScreen) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }

      if (actionConfig) {
        await this.actionService.createActionRequest(
          {
            document: this.splashScreenRepository.metadata.name,
            actionType: 'update',
            targetEntityId: id.toString(),
            user: admin,
            payload: JSON.stringify(rest),
          },
          admin,
        );
        return new SuccessResponse('Action is awaiting approval');
      }

      const { affected } = await this.splashScreenRepository.update(id, rest);

      if (affected > 0) {
        const splashScreen = await this.splashScreenRepository.findOneByOrFail({
          id,
        });
        await this.activityLogService.logActivity([
          {
            adminId: admin.id,
            action: ActivityEnum.UPDATED,
            details: JSON.stringify(splashScreen),
            splashScreenId: splashScreen.id,
          },
        ]);

        return new SuccessResponse(AppStrings.SUCCESSFULL, splashScreen);
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

  async delete(deleteSplashScreenInput: DeleteSplashScreenInput, admin: User) {
    try {
      const [splashScreens, actionConfig] = await Promise.all([
        this.splashScreenRepository.find({
          where: { id: In(deleteSplashScreenInput.id) },
        }),
        this.workflowService.findOneWorkflowByDocumentname(
          this.splashScreenRepository.metadata.name,
        ),
      ]);

      if (splashScreens.length === 0) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }

      if (actionConfig) {
        for (const element of splashScreens) {
          element.deletedAt = new Date();
          await this.actionService.createActionRequest(
            {
              document: this.splashScreenRepository.metadata.name,
              actionType: 'update',
              targetEntityId: element.id.toString(),
              user: admin,
              payload: JSON.stringify(element),
            },
            admin,
          );
        }

        const activityToSave = splashScreens.map((element) => {
          return {
            adminId: admin.id,
            action: ActivityEnum.DELETED,
            splashScreenId: element.id,
            details: JSON.stringify(element),
          };
        });

        await this.activityLogService.logActivity(activityToSave);

        return new SuccessResponse('Awaiting approval');
      } else {
        // Batch delete operation if no actionConfig is needed
        const { affected } = await this.splashScreenRepository.softDelete(
          deleteSplashScreenInput.id,
        );
        if (affected > 0) {
          return new SuccessResponse(AppStrings.DELETED_SUCCESSFULLY);
        }
      }
    } catch (error) {
      this.logger.error(error.stack || error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new UnprocessableEntityException(
          error.message || 'An error occurred',
        );
      }
    }
  }

  async uploadImage(id: number, file: Express.Multer.File[]) {
    try {
      const splashScreen = await this.splashScreenRepository.findOneByOrFail({
        id,
      });

      if (!splashScreen) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }
      const url = await this.storageService.upload(file[0]);

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
      splashScreen = await this.splashScreenRepository.findOne({
        where: {
          startDate: MoreThan(new Date()),
          endDate: LessThanOrEqual(new Date()),
        },
      });

      if (!splashScreen) {
        splashScreen = await this.splashScreenRepository.findOne({
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
      return await this.splashScreenRepository
        .createQueryBuilder('splashScreen')

        .orWhere('splashScreen.title ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('splashScreen.placement ILIKE :term', {
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
