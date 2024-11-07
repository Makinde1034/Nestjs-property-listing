import { DataSource, Repository } from 'typeorm';
import { ActionRequest } from '../../../entities/request.action.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ActionRequestRepository extends Repository<ActionRequest> {
  constructor(private readonly dateSource: DataSource) {
    super(ActionRequest, dateSource.createEntityManager());
  }
}
