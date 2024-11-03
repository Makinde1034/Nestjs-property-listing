import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { Service } from '../../../entities/services.entity';
@Injectable()
export class ServiceRepository extends Repository<Service> {
  constructor(private readonly dataSource: DataSource) {
    super(Service, dataSource.createEntityManager());
  }
}
