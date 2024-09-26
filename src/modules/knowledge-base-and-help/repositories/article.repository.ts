/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { Article } from '../../../entities/article.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ArticleRepository extends Repository<Article> {
  constructor(private dataSource: DataSource) {
    super(Article, dataSource.createEntityManager());
  }
}
