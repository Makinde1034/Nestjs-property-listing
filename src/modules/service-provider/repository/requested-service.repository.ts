import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ServiceRequested } from '../../../entities/service-requested.entity';

@Injectable()
export class ServiceRequestedRepository extends Repository<ServiceRequested> {
  constructor(private readonly dataSource: DataSource) {
    super(ServiceRequested, dataSource.createEntityManager());
  }
}
