import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminWorkflowService } from '../services/admin-workflow.service';
import {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowInputFilter,
} from '../dto/request/workflow';
import { WorkFlow } from '../../../entities/workFlow.entity';
import { WorkFlowResponse } from '../dto/response/workflow';
import { UseGuards } from '@nestjs/common';
import { Permissions } from '../../../common/decorator/permission';
import { PermissionsEnum } from '../../../common/enums/permission.enum';
import { PermissionsGuard } from '../../auth/guards';

@Resolver()
export class WorkFlowResolver {
  constructor(private readonly workFlowService: AdminWorkflowService) {}

  @UseGuards(PermissionsGuard)
  @Permissions(PermissionsEnum.WORKFLOW_CREATE)
  @Mutation(() => WorkFlow)
  async createWorkFlow(createWorkFlowInput: CreateWorkflowInput) {
    return await this.workFlowService.createWorkFlow(createWorkFlowInput);
  }
  @UseGuards(PermissionsGuard)
  @Permissions(PermissionsEnum.WORKFLOW_READ)
  @Query(() => WorkFlowResponse)
  async findAllWorkFlow(@Args('findOption') findOption: WorkflowInputFilter) {
    return await this.workFlowService.findAllWorkflow(findOption);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(PermissionsEnum.WORKFLOW_READ)
  @Query(() => WorkFlow)
  async findOneWorkFlow(@Args('id') id: string) {
    return await this.workFlowService.findOneWorkflow(id);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(PermissionsEnum.WORKFLOW_EDIT)
  @Mutation(() => WorkFlow)
  async updateWorkFlow(updateWorkFlowInput: UpdateWorkflowInput) {
    return await this.workFlowService.update(updateWorkFlowInput);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(PermissionsEnum.WORKFLOW_DELETE)
  @Mutation(() => WorkFlow)
  async deleteWorkFlow(id: string) {
    return await this.workFlowService.delete(id);
  }
}
