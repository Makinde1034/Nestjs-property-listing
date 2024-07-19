/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { Attribute } from '../../../entities';

import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AttributeRepository extends Repository<Attribute> {
  constructor(private dataSource: DataSource) {
    super(Attribute, dataSource.createEntityManager());
  }
}
