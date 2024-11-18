import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
import { AppStrings } from '../../../common/messages/app.strings';
import { WorkFlowResponse } from '../dto/response/workflow';
@Injectable()
export class AdminWorkflowService {
  constructor(
    private readonly workflowRepository: WorkflowRepository,
    private readonly dataSource: DataSource,
  ) {}
  logger = new Logger(AdminWorkflowService.name);
  async createWorkFlow(createWorkFlowInput: CreateWorkflowInput) {
    try {
      return await this.workflowRepository.save(createWorkFlowInput);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
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
      throw new BadRequestException(
        'Failed to retrieve workflows. Please try again.',
      );
    }
  }

  async findAllDocument(): Promise<SuccessResponse> {
    try {
      // Get all entity metadata and map to table names
      const data = this.dataSource.entityMetadatas.map(
        (metadata) => metadata.tableName,
      );

      return new SuccessResponse(AppStrings.SUCCESSFULL, data);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async findOneWorkflow(id: string) {
    try {
      return await this.workflowRepository.findOneBy({ id });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async findOneWorkflowByDocumentname(document: string) {
    try {
      return await this.workflowRepository.findOne({
        where: { document: document },
      });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async delete(actionInput: ActionsInput) {
    try {
      // Perform soft delete based on IDs in actionInput
      const { affected } = await this.workflowRepository.softDelete({
        id: In(actionInput.id), // Use the `In` operator to delete multiple rows by ID
      });

      if (affected && affected > 0) {
        // Return a success response if rows were affected
        return new SuccessResponse(AppStrings.SUCCESSFULL, {
          affected,
          message: `${affected} workflow(s) successfully deleted.`,
        });
      } else {
        // Handle case where no rows were deleted
        throw new BadRequestException(AppStrings.NOT_FOUND); // Replace `AppStrings.NOT_FOUND` with an appropriate error message
      }
    } catch (error) {
      // Log and throw the error
      this.logger.error('Error deleting workflows:', error);
      throw new BadRequestException(
        error.message || 'Failed to delete workflows.',
      );
    }
  }

  async update(updateWorkflow: UpdateWorkflowInput) {
    try {
      const { id, ...rest } = updateWorkflow;
      return await this.workflowRepository.update(id, rest);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
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
      throw new BadRequestException('Failed to update workflow status');
    }
  }

  async searchForworkflow(searchParam: string) {
    try {
      return await this.workflowRepository
        .createQueryBuilder('workflow')

        .where('workflow.name ILIKE :term', { term: `%${searchParam}%` })
        .orWhere('workflow.document ILIKE :term', { term: `%${searchParam}%` })

        .take(10)
        .getMany();
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
}
