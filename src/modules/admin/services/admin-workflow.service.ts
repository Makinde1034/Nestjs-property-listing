import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { WorkflowRepository } from '../repositories/workflow.repository';
import {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowInputFilter,
} from '../dto/request/workflow';
import { DataSource } from 'typeorm';
import { SuccessResponse } from '../../../common/utils/success.response';
import { AppStrings } from '../../../common/messages/app.strings';
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

  async findAllWorkflow(paginateAndSort: WorkflowInputFilter) {
    try {
      const [workflow, total] = await this.workflowRepository.findAndCount({});

      return { workflow, total };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
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
