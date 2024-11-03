import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ServiceProvider } from '../../../entities/service-provider.entity';
@Injectable()
export class ServiceProviderRepository extends Repository<ServiceProvider> {
  constructor(private readonly dataSource: DataSource) {
    super(ServiceProvider, dataSource.createEntityManager());
  }
}
