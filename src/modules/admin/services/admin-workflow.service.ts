/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { WorkflowRepository } from '../repositories/workflow.repository';
import {
  ActionsInput,
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowActionInput,
  WorkflowInputFilter,
} from '../dto/request/workflow';
import { DataSource, In } from 'typeorm';
import { SuccessResponse } from '../../../common/utils/success.response';
import { AppStrings, messagesKeys } from '../../../common/messages/app.strings';
import { WorkFlowResponse } from '../dto/response/workflow';
import { ActivityLogService } from '../../activity-log/services/activity-log.service';
import { User } from '../../../entities';
import { ActivityEnum } from '../../../common/enums/activitys';
import { I18nService } from 'nestjs-i18n';
import { Int } from '@nestjs/graphql';
@Injectable()
export class AdminWorkflowService {
  constructor(
    private readonly workflowRepository: WorkflowRepository,
    private readonly dataSource: DataSource,
    private readonly activityLogService: ActivityLogService,
    private readonly i18n: I18nService,
  ) {}
  logger = new Logger(AdminWorkflowService.name);
  async createWorkFlow(createWorkFlowInput: CreateWorkflowInput, admin: User) {
    try {
      const workflow = await this.findOneWorkflowByDocumentname(
        createWorkFlowInput.document,
      );

      if (workflow && workflow?.action == createWorkFlowInput.action) {
        throw new BadRequestException(
          this.i18n.t(`messages.${messagesKeys.WORKFLOW_EXIST}`),
        );
      }
      const data = await this.workflowRepository.save(createWorkFlowInput);
      await this.activityLogService.logActivity([
        {
          adminId: admin.id,
          action: ActivityEnum.CREATED,
          details: JSON.stringify(data),
          workflowId: data.id,
        },
      ]);
      return data;
    } catch (error) {
      this.logger.log(error);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async findAllWorkflow(
    paginateAndSort: WorkflowInputFilter,
  ): Promise<WorkFlowResponse> {
    try {
      const { skip = 0, take = 10, isActive } = paginateAndSort;

      const queryOptions: any = {};

      // Apply filtering if 'isActive' is provided
      if (isActive !== undefined) {
        queryOptions.where = { isActive };
      }
      if (paginateAndSort.take) {
        queryOptions.skip = skip;
        queryOptions.take = take;
      }

      // Build the query options
      const [workflow, total] =
        await this.workflowRepository.findAndCount(queryOptions);

      return { workflow, total };
    } catch (error) {
      this.logger.error('Error fetching workflows', error);
      throw new InternalServerErrorException(
        this.i18n.t(`messages.${messagesKeys.INTERNAL_SERVER_EXCEPTION}`),
      );
    }
  }

  async findAllDocument(): Promise<SuccessResponse> {
    try {
      // Get all entity metadata and map to table names

      const payload = [
        'parent_issue',
        'child_issue',
        'feature',
        'auction',
        'attribute',
        'attribute_set',
        'listing_type',
        'response_template',
        'category',
        'article',
        'splash_screen',
        'service_provider',
        'role',
        'notification_scope',
        'user',
        'work_flow',
        'admin_notification_preference',
        'admin_default',
        'coupon',
        'notification_messages',
        'auction_bid_range',
        'system_feature_setting',
      ];

      return new SuccessResponse(AppStrings.SUCCESSFULL, payload);
    } catch (error) {
      this.logger.log(error);
      throw new InternalServerErrorException(
        this.i18n.t(`messages.${messagesKeys.INTERNAL_SERVER_EXCEPTION}`),
      );
    }
  }

  async findOneWorkflow(id: string) {
    try {
      return await this.workflowRepository.findOneBy({ id });
    } catch (error) {
      this.logger.log(error);
      throw new NotFoundException(
        this.i18n.t(`messages.${messagesKeys.NOT_FOUND}`),
      );
    }
  }

  async findOneWorkflowByDocumentname(document: string) {
    try {
      return await this.workflowRepository.findOne({
        where: { document: document },
      });
    } catch (error) {
      this.logger.log(error);
      throw new NotFoundException(
        this.i18n.t(`messages.${messagesKeys.NOT_FOUND}`),
      );
    }
  }

  async delete(actionInput: ActionsInput, admin: User) {
    try {
      const workflowToDelete = await this.workflowRepository.find({
        where: { id: In(actionInput.id) },
      });
      // Perform soft delete based on IDs in actionInput
      const { affected } = await this.workflowRepository.softDelete({
        id: In(actionInput.id), // Use the `In` operator to delete multiple rows by ID
      });

      const activityToSave = workflowToDelete.map((element) => ({
        adminId: admin.id,
        details: JSON.stringify(element),
        action: ActivityEnum.DELETED,
        workflowId: element.id,
      }));

      await this.activityLogService.logActivity(activityToSave);

      if (affected && affected > 0) {
        // Return a success response if rows were affected
        return new SuccessResponse(AppStrings.SUCCESSFULL, {
          affected,
          message: `${affected} workflow(s) successfully deleted.`,
        });
      }
      // Handle case where no rows were deleted
      throw new BadRequestException(AppStrings.NOT_FOUND); // Replace `AppStrings.NOT_FOUND` with an appropriate error message
    } catch (error) {
      // Log and throw the error
      this.logger.error('Error deleting workflows:', error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async update(updateWorkflow: UpdateWorkflowInput, admin: User) {
    try {
      const { id, ...rest } = updateWorkflow;
      const { affected } = await this.workflowRepository.update(id, rest);

      await this.activityLogService.logActivity([
        {
          adminId: admin.id,
          action: ActivityEnum.CREATED,
          details: JSON.stringify(rest),
          workflowId: id,
        },
      ]);

      if (affected) {
        return new SuccessResponse(AppStrings.SUCCESSFULL);
      }

      return new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.UNABLE_TO_UPDATE}`),
      );
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async reactivateAndDeactivate(updateWorkflow: WorkflowActionInput) {
    try {
      const { id, isActive } = updateWorkflow;

      // Fetch workflows by IDs
      const workflows = await this.workflowRepository.find({
        where: { id: In(id) },
      });

      // Map through workflows to update their `isActive` property
      const workflowsToUpdate = workflows.map((workflow) => ({
        ...workflow,
        isActive: isActive,
      }));

      // Save the updated workflows back to the repository
      const data = await this.workflowRepository.save(workflowsToUpdate);

      return new SuccessResponse(AppStrings.SUCCESSFULL, data);
    } catch (error) {
      this.logger.error('Error updating workflow status:', error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.UNABLE_TO_UPDATE}`),
      );
    }
  }

  async searchForWorkflow(searchParam: string) {
    try {
      return await this.workflowRepository
        .createQueryBuilder('workflow')

        .where('workflow.name ILIKE :term', { term: `%${searchParam}%` })
        .orWhere('workflow.document ILIKE :term', { term: `%${searchParam}%` })

        .take(10)
        .getMany();
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }
}
