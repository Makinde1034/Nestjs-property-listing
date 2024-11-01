import { DataSource, Repository } from 'typeorm';
import { ServiceProvider } from '../../entities/service-provider.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
export class ServiceProviderRepository extends Repository<ServiceProvider> {
  constructor(private readonly dataSource: DataSource) {
    super(ServiceProvider, dataSource.createEntityManager());
  }
}
