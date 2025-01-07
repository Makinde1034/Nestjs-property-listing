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

@Injectable()
export class ActionService {
  constructor(
    private readonly actionRequestRepository: ActionRequestRepository,

    private readonly dataSource: DataSource, // Injected Connection to access dynamic repositories

    private readonly eventEmitter: EventEmitter2,

    private readonly notificationScopeRepository: NotificationScopeRepository,
    private readonly workflowRepository: WorkflowRepository,

    private readonly userRepository: UserRepository,
  ) {}
  logger = new Logger(ActionService.name);

  async applyApprovedRequest(action: Actions) {
    // Preload the requests in one call to avoid querying the database multiple times

    const actionRequests = await this.actionRequestRepository.find({
      where: { id: In(action.id) },
    });

    this.userRepository.find({ where: { roles: { id: In(actionRequests) } } });

    // Process each action request
    for (const actionRequest of actionRequests) {
      const { targetEntity, targetEntityId, payload, event } = actionRequest;

      const repository = this.dataSource.getRepository(targetEntity);

      if (actionRequest.actionType === 'update' && targetEntityId == null) {
        await repository.save(JSON.parse(actionRequest.payload));
      }

      // Handle 'update' action type
      else if (actionRequest.actionType === 'update' && targetEntityId) {
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
      }
      // Handle 'create' action type
      else if (actionRequest.actionType === 'create') {
        const newEntity = JSON.parse(payload);
        await repository.save(newEntity);
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

      return new SuccessResponse('successful', actionRequest);
    }
  }

  async createActionRequest(
    input: CreateActionInput,
    user: User,
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
        recipientFormat: ['Admin Approver', null],
      });

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }
}
