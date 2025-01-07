/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { ServiceProvided } from '../../../entities/service-provided.entity';
@Injectable()
export class ServiceProvidedRepository extends Repository<ServiceProvided> {
  constructor(private readonly dataSource: DataSource) {
    super(ServiceProvided, dataSource.createEntityManager());
  }
}
