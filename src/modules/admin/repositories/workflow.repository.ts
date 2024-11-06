import { DataSource, Repository } from 'typeorm';
import { WorkFlow } from '../../../entities/workFlow.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkflowRepository extends Repository<WorkFlow> {
  constructor(private readonly dataSource: DataSource) {
    super(WorkFlow, dataSource.createEntityManager());
  }
}
