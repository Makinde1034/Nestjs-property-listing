/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { Category } from '../../../entities/knowledge-base-category.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
export class KnowledgeBaseCategoryRepository extends Repository<Category> {
  constructor(private dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }
}
