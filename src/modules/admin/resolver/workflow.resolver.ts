import { Mutation, Resolver } from '@nestjs/graphql';
import { AdminWorkflowService } from '../services/admin-workflow.service';
import { CreateWorkflowInput } from '../dto/request/workflow';
import { WorkFlow } from '../../../entities/workFlow.entity';
@Resolver()
export class WorkFlowResolver {
  constructor(private readonly workFlowService: AdminWorkflowService) {}
  @Mutation(() => WorkFlow)
  async createWorkFlow(createWorkFlowInput: CreateWorkflowInput) {
    return await this.workFlowService.createWorkFlow(createWorkFlowInput);
  }
}
