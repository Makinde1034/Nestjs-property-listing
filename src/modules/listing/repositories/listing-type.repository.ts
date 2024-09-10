/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { ListingType } from '../../../entities';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityRepository } from '../../core/base.class/entity.repository';

@Injectable()
export class ListingTypeRepository extends EntityRepository<ListingType> {
  constructor(
    @InjectRepository(ListingType)
    private readonly repository: Repository<ListingType>,
  ) {
    super(repository);
  }
}
// @Injectable()
// Export class ListingTypeRepository extends Repository<ListingType> {
//   Constructor(private dataSource: DataSource) {
//     Super(ListingType, dataSource.createEntityManager());
//   }
// }
