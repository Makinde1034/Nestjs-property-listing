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
import { ActionRequest } from '../../../entities/request.action.entity';
import { ActionRequestRepository } from '../repositories/action.repository';

import { User } from '../../../entities';
import { DataSource, In } from 'typeorm';
import { CreateActionInput } from '../dto/request/action';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Actions } from '../dto/request/workflow';
import { SuccessResponse } from '../../../common/utils/success.response';
import { NotificationEvent } from '../../../common/enums';
import {
  NotificationScopeRepository,
  UserRepository,
} from '../../user/repositories';
import { NotificationScopeEnum } from '../../../common/enums/notification-scope.enum';

import { WorkflowRepository } from '../repositories/workflow.repository';
import { AdminFilterAndSort } from '../../listing/dtos/request';
import {
  startOfDay,
  endOfDay,
  subWeeks,
  startOfWeek,
  endOfWeek,
  subMonths,
  startOfMonth,
  endOfMonth,
  subYears,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { TimePeriod } from '../../../common/enums/sort.enum';
import { AdminDashboardSort } from '../dto/request/admin-request';
import { messagesKeys } from '../../../common/messages/app.strings';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ActionService {
  constructor(
    private readonly actionRequestRepository: ActionRequestRepository,

    private readonly dataSource: DataSource, // Injected Connection to access dynamic repositories

    private readonly eventEmitter: EventEmitter2,

    private readonly notificationScopeRepository: NotificationScopeRepository,
    private readonly workflowRepository: WorkflowRepository,
    private i18n: I18nService,

    private readonly userRepository: UserRepository,
  ) {}
  logger = new Logger(ActionService.name);

  async applyApprovedRequest(action: Actions, user: User) {
    // Preload the requests in one call to avoid querying the database multiple times

    const actionRequests = await this.actionRequestRepository.find({
      where: { id: In(action.id) },
    });

    await this.userRepository.find({
      where: { roles: { id: In(actionRequests) } },
    });

    // Process each action request
    for (const actionRequest of actionRequests) {
      const { targetEntity, targetEntityId, payload, event } = actionRequest;

      const repository = this.dataSource.getRepository(targetEntity);

      if (
        actionRequest.actionType === 'update' &&
        targetEntityId == null &&
        actionRequest.currentApproval === actionRequest.approval
      ) {
        await repository.save(JSON.parse(actionRequest.payload));
      } else {
        await this.actionRequestRepository.update(actionRequest.id, {
          currentApproval: actionRequest.currentApproval + 1,
        });
      }

      // Handle 'update' action type
      if (
        actionRequest.actionType === 'update' &&
        targetEntityId &&
        actionRequest.currentApproval >= actionRequest.approval
      ) {
        const entity = await repository.findOne({
          where: { id: targetEntityId },
        });

        if (!entity) {
          throw new NotFoundException(
            `${targetEntity} with ID ${targetEntityId} not found`,
          );
        }

        // Apply the payload to the entity and save
        Object.assign(entity, JSON.parse(payload));
        await repository.save(entity);
      } else {
        await this.actionRequestRepository.update(actionRequest.id, {
          currentApproval: actionRequest.currentApproval + 1,
        });
      }

      // Handle 'create' action type
      if (
        actionRequest.actionType === 'create' &&
        actionRequest.currentApproval >= actionRequest.approval
      ) {
        const newEntity = JSON.parse(payload);
        await repository.save(newEntity);
      } else {
        await this.actionRequestRepository.update(actionRequest.id, {
          currentApproval: actionRequest.currentApproval + 1,
        });
      }

      // Handle event emission
      if (event) {
        try {
          const data: [string, any] = JSON.parse(event);

          if (Array.isArray(data) && data.length >= 2) {
            // Emit the event
            this.eventEmitter.emit(data[0], data[1]);
          } else {
            this.logger.log(
              'Event data must be an array with at least two elements.',
            );
          }
        } catch (error) {
          this.logger.error('Failed to parse event data', error);
        }
      }
    }
    return new SuccessResponse('Action request applied');
  }

  async createActionRequest(
    input: CreateActionInput,
    user: User,
    approval: number,
  ): Promise<ActionRequest> {
    try {
      const { actionType, targetEntityId, payload, document, event } = input;

      const actionRequest = this.actionRequestRepository.create({
        actionType,
        targetEntity: document,
        targetEntityId: targetEntityId ? String(input.targetEntityId) : null,
        payload,
        user,
        event: event,
        approval: approval,
      });

      const [scope, data] = await Promise.all([
        this.notificationScopeRepository.findOne({
          where: { name: NotificationScopeEnum.WORKFLOW_EVENTS },
        }),

        this.actionRequestRepository.save(actionRequest),
      ]);

      this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
        creatorId: actionRequest.id,
        receiverId: null,
        scope: scope,
        metadata: JSON.stringify(actionRequest),

        recipientFormat: ['Admin Approver', null],
      });

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async findActionRequestById(id: number): Promise<ActionRequest> {
    try {
      const action = await this.actionRequestRepository.findOne({
        where: { id },
      });
      if (!action) {
        throw new NotFoundException(
          this.i18n.t(
            `messages.${messagesKeys.FAILED_TO_RETRIVE_ACTION_REQUEST}`,
          ),
        );
      }
      return action;
    } catch (error) {
      this.logger.error('Error fetching action request', error);
      throw new BadRequestException(
        this.i18n.t(
          `messages.${messagesKeys.FAILED_TO_RETRIVE_ACTION_REQUEST}`,
        ),
      );
    }
  }
  async findManyActionRequestBy(
    findOptions: AdminDashboardSort,
    user: User,
  ): Promise<ActionRequest[]> {
    try {
      const currentDate = new Date();
      let startDate, endDate, groupByInterval, duration;

      if (!findOptions || !findOptions.timePeriod) {
        throw new Error('Time period is required');
      }

      // Determine date range and grouping
      switch (findOptions.timePeriod) {
        case TimePeriod.Today:
          startDate = startOfDay(currentDate);
          endDate = endOfDay(currentDate);
          groupByInterval = 'hour';
          break;

        case TimePeriod.Week:
          const baseDate = subWeeks(currentDate, findOptions.value || 0);
          startDate = startOfWeek(baseDate);
          endDate = endOfWeek(baseDate);
          groupByInterval = 'day';
          break;

        case TimePeriod.Month:
          if (findOptions.value === 6) {
            const sixMonthsAgo = subMonths(currentDate, 5);
            startDate = startOfMonth(sixMonthsAgo);
            endDate = endOfMonth(currentDate);
            groupByInterval = 'month';
            duration = 6; // Last 6 months
          } else {
            const monthDate = subMonths(currentDate, findOptions.value || 0);
            startDate = startOfMonth(monthDate);
            endDate = endOfMonth(monthDate);
            groupByInterval = 'week'; // Weeks within the month
          }
          break;

        case TimePeriod.Year:
          const yearDate = subYears(currentDate, findOptions.value || 0);
          startDate = startOfYear(yearDate);
          endDate = endOfYear(yearDate);
          groupByInterval = 'month';
          break;

        default:
          throw new Error('Invalid time period');
      }

      const baseQuery = this.actionRequestRepository
        .createQueryBuilder('actionRequest')
        .where('actionRequest. BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });

      const [action, total] = await baseQuery
        .take(findOptions.take)
        .skip(findOptions.skip)
        .getManyAndCount();

      return action;
    } catch (error) {
      this.logger.error('Error fetching action request', error);
      throw new BadRequestException(
        this.i18n.t(
          `messages.${messagesKeys.FAILED_TO_RETRIVE_ACTION_REQUEST}`,
        ),
      );
    }
  }
}
