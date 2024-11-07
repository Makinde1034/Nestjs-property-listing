import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { WorkflowRepository } from '../repositories/workflow.repository';
import {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowInputFilter,
} from '../dto/request/workflow';
@Injectable()
export class AdminWorkflowService {
  constructor(private readonly workflowRepository: WorkflowRepository) {}
  logger = new Logger(AdminWorkflowService.name);
  async createWorkFlow(createWorkFlowInput: CreateWorkflowInput) {
    try {
      return await this.workflowRepository.save(createWorkFlowInput);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async findAllWorkflow(paginateAndSort: WorkflowInputFilter) {
    try {
      return await this.workflowRepository.findAndCount({});
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

  async delete(id: string) {
    try {
      return await this.workflowRepository.softDelete({ id });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
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
}
