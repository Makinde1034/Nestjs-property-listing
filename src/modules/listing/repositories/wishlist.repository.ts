/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { Wishlist } from '../../../entities/wishlist.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
export class WishListRepository extends Repository<Wishlist> {
  constructor(private dataSource: DataSource) {
    super(Wishlist, dataSource.createEntityManager());
  }
}
