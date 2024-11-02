import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { ServiceStatus } from '../../entities/provider-service-status.entity';
@Injectable()
export class ServiceStatusRepository extends Repository<ServiceStatus> {
  constructor(private readonly dataSource: DataSource) {
    super(ServiceStatus, dataSource.createEntityManager());
  }
}
