/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ServiceProvider } from '../../../entities/service-provider.entity';
@Injectable()
export class ServiceProviderRepository extends Repository<ServiceProvider> {
  constructor(private readonly dataSource: DataSource) {
    super(ServiceProvider, dataSource.createEntityManager());
  }
}
