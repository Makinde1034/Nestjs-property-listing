import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminWorkflowService } from '../services/admin-workflow.service';
import {
  Actions,
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowInputFilter,
} from '../dto/request/workflow';
import { WorkFlow } from '../../../entities/workFlow.entity';
import { WorkFlowResponse } from '../dto/response/workflow';
import { UseGuards } from '@nestjs/common';
import { Permissions } from '../../../common/decorator/permission';
import { PermissionsEnum } from '../../../common/enums/permission.enum';
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';
import { ActionService } from '../services/action.service';
import { SuccessResponse } from '../../../common/utils/success.response';

@Resolver()
export class WorkFlowResolver {
  constructor(
    private readonly workFlowService: AdminWorkflowService,
    private readonly actionService: ActionService,
  ) {}

  @UseGuards(PermissionsGuard)
  @Permissions(PermissionsEnum.WORKFLOW_CREATE)
  @Mutation(() => WorkFlow)
  async createWorkFlow(
    @Args('createWorkflowInput') createWorkflowInput: CreateWorkflowInput,
  ) {
    return await this.workFlowService.createWorkFlow(createWorkflowInput);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(PermissionsEnum.WORKFLOW_READ)
  @Query(() => WorkFlowResponse)
  async findAllWorkFlow(@Args('findOption') findOption: WorkflowInputFilter) {
    return await this.workFlowService.findAllWorkflow(findOption);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(PermissionsEnum.WORKFLOW_READ)
  @Query(() => SuccessResponse)
  async findAllDocument() {
    return await this.workFlowService.findAllDocument();
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
  async updateWorkFlow(
    @Args('updateWorkFlowInput') updateWorkFlowInput: UpdateWorkflowInput,
  ) {
    return await this.workFlowService.update(updateWorkFlowInput);
  }
  @UseGuards(PermissionsGuard)
  @Permissions(PermissionsEnum.WORKFLOW_EDIT)
  @Mutation(() => SuccessResponse)
  async approveAction(@Args('action') actions: Actions) {
    return await this.actionService.applyApprovedRequest(actions);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(PermissionsEnum.WORKFLOW_DELETE)
  @Mutation(() => WorkFlow)
  async deleteWorkFlow(id: string) {
    return await this.workFlowService.delete(id);
  }

  @Permissions(PermissionsEnum.KNOWLEDGE_BASE_READ)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => [WorkFlow], { name: 'searchForworkflow' })
  @UseGuards(AccessTokenGuard)
  async searchForworkflow(@Args('searchParam') searchParam: string) {
    return await this.workFlowService.searchForworkflow(searchParam);
  }
}
