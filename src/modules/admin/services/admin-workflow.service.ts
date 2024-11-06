import { Injectable, Logger } from '@nestjs/common';
@Injectable()
export class AdminWorkflowService {
  constructor() {}

  logger = new Logger(AdminWorkflowService.name);

  async createWorkFlow(createWorkFlowInput) {
    return;
  }
}
