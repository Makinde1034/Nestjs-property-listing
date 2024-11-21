import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { ServiceProvided } from '../../../entities/service-provided.entity';
@Injectable()
export class ServiceProvidedRepository extends Repository<ServiceProvided> {
  constructor(private readonly dataSource: DataSource) {
    super(ServiceProvided, dataSource.createEntityManager());
  }
}
