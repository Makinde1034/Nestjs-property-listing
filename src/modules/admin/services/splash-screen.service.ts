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
import { startOfDay, endOfDay, subMonths, subWeeks, subYears } from 'date-fns';
import { AdminWorkflowService } from './admin-workflow.service';
import { ActionService } from './action.service';
import { SplashScreenPlacement } from '../../../common/enums/splashScreen';
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
      const documentName = this.splashScreenRepository.metadata.tableName;

      // Check for workflow configuration
      const actionConfigPromise =
        this.workflowService.findOneWorkflowByDocumentname(documentName);

      // Prepare splash screen instance
      const splashScreen =
        this.splashScreenRepository.create(createSplashScreen);

      const overlappingSplashScreens = await this.splashScreenRepository
        .createQueryBuilder('splashScreen')
        .where(
          '(splashScreen.startDate BETWEEN :start AND :end OR splashScreen.endDate BETWEEN :start AND :end OR :start BETWEEN splashScreen.startDate AND splashScreen.endDate  AND :placement = splashScreen.placement)',
          {
            start: createSplashScreen.startDate,
            end: createSplashScreen.endDate,
            placement: createSplashScreen.placement,
          },
        )
        .getCount();

      if (overlappingSplashScreens > 0) {
        throw new BadRequestException(
          'A schedule matching this date range already exists',
        );
      }

      // Await workflow configuration result
      const actionConfig = await actionConfigPromise;
      const approval = actionConfig?.approvalTwoRole.length > 0 ? 2 : 1; //if approval role 2 has an id the it requires  two approvals

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
            approval,
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
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadGatewayException('Failed to create splash screen');
    }
  }

  async findAll(
    findOption: SplashScreenFilterInput,
  ): Promise<{ splashScreen: SplashScreen[]; total: number }> {
    try {
      const now = new Date();
      let whereCondition = {};

      const dateField = 'createdAt';

      const timePeriods: Record<string, [Date, Date]> = {
        today: [startOfDay(now), endOfDay(now)],
        week: [subWeeks(now, 1), now],
        month: [subMonths(now, 1), now],
        year: [subYears(now, 1), now],
      };

      const period = timePeriods[findOption.timePeriod];
      if (period) {
        whereCondition[dateField] = Between(...period);
      } else {
        throw new Error(`Unsupported time period: ${findOption.timePeriod}`);
      }

      const queryBuilder =
        this.splashScreenRepository.createQueryBuilder('splash_screen');
      queryBuilder
        // Fetch only necessary fields
        .where(whereCondition)
        .orderBy('splash_screen.createdAt', 'DESC')
        // Add index-friendly ordering
        .take(Math.min(findOption.take ?? 20, 20)) // Enforce max limit
        .skip(findOption.skip ?? 0); // Pagination

      const [splashScreen, total] = await Promise.all([
        queryBuilder.getMany(), // Get the actual data
        queryBuilder.getCount(), // Fetch the count efficiently
      ]);

      return { splashScreen, total };
    } catch (error) {
      this.logger.error('Error fetching splash screens', error.stack);
      throw new BadRequestException('An error occurred while fetching data');
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

  async update(
    updateSplashScreenInput: UpdateSplashScreenInput,
    admin: User,
  ): Promise<SuccessResponse> {
    try {
      const { id, ...rest } = updateSplashScreenInput;

      // Fetch data in parallel to minimize waiting time
      const [splashScreen, actionConfig] = await Promise.all([
        this.splashScreenRepository.findOneBy({ id }),
        this.workflowService.findOneWorkflowByDocumentname(
          this.splashScreenRepository.metadata.tableName,
        ),
      ]);

      // Handle splash screen not found
      if (!splashScreen) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }
      const approval = actionConfig?.approvalTwoRole.length > 0 ? 2 : 1; //if approval role 2 has an id the it requires  two approvals

      // Handle workflow-based action if applicable
      if (actionConfig) {
        await this.actionService.createActionRequest(
          {
            document: this.splashScreenRepository.metadata.tableName,
            actionType: 'update',
            targetEntityId: id.toString(),
            user: admin,
            payload: JSON.stringify(rest),
          },
          admin,
          approval,
        );
        return new SuccessResponse('Action is awaiting approval');
      }

      // Update the splash screen
      const { affected } = await this.splashScreenRepository.update(id, rest);

      if (affected > 0) {
        // Fetch updated splash screen details
        const updatedSplashScreen =
          await this.splashScreenRepository.findOneByOrFail({ id });

        // Log the activity asynchronously
        this.activityLogService
          .logActivity([
            {
              adminId: admin.id,
              action: ActivityEnum.UPDATED,
              details: JSON.stringify(updatedSplashScreen),
              splashScreenId: updatedSplashScreen.id,
            },
          ])
          .catch((err) => this.logger.warn('Activity logging failed', err)); // Log any failure in logging

        return new SuccessResponse(AppStrings.SUCCESSFULL, updatedSplashScreen);
      }

      throw new BadRequestException('Update failed. No records were affected.');
    } catch (error) {
      this.logger.error('Error updating splash screen', error.stack);

      // Re-throw HTTP exceptions directly, otherwise handle as an unprocessable error
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new UnprocessableEntityException('An unexpected error occurred');
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
          this.splashScreenRepository.metadata.tableName,
        ),
      ]);

      if (splashScreens.length === 0) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }
      const approval = actionConfig?.approvalTwoRole.length > 0 ? 2 : 1; //if approval role 2 has an id the it requires  two approvals

      if (actionConfig) {
        for (const element of splashScreens) {
          element.deletedAt = new Date();
          await this.actionService.createActionRequest(
            {
              document: this.splashScreenRepository.metadata.tableName,
              actionType: 'update',
              targetEntityId: element.id.toString(),
              user: admin,
              payload: JSON.stringify(element),
            },
            admin,
            approval,
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
      }
      // Batch delete operation if no actionConfig is needed
      const { affected } = await this.splashScreenRepository.softDelete(
        deleteSplashScreenInput.id,
      );
      if (affected > 0) {
        return new SuccessResponse(AppStrings.DELETED_SUCCESSFULLY);
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
  async fetchDefaultForBanner() {
    let splashScreen: SplashScreen;
    try {
      // Fetch currently active banner
      splashScreen = await this.splashScreenRepository.findOne({
        where: {
          placement: SplashScreenPlacement.MAIN_BANNER,
          startDate: LessThanOrEqual(new Date()), // Started in the past or today
          endDate: MoreThan(new Date()), // Ends in the future
        },
      });

      // If no active banner is found, fetch the default
      if (!splashScreen) {
        splashScreen = await this.splashScreenRepository.findOne({
          where: {
            default: true,
            placement: SplashScreenPlacement.MAIN_BANNER,
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
