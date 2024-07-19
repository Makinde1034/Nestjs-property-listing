/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ListingAttributes } from '../../../entities/listing-attributes.entity';

@Injectable()
export class ListingAttributeRepository extends Repository<ListingAttributes> {
  constructor(private dataSource: DataSource) {
    super(ListingAttributes, dataSource.createEntityManager());
  }
}
