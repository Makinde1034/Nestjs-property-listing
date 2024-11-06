import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { WorkflowRepository } from '../repositories/workflow.repository';
import { CreateWorkflowInput } from '../dto/request/workflow';
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

  async findAllWorkflow(paginateAndSort) {
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
}
