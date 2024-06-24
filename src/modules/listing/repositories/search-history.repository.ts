/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { SearchHistory } from '../../../entities/search-history.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchHistoryRepository extends Repository<SearchHistory> {
  constructor(private dataSource: DataSource) {
    super(SearchHistory, dataSource.createEntityManager());
  }
}
