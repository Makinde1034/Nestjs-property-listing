/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { KnowledgeBaseAndHelpResolver } from './resolvers/knowledge-base-and-help.resolver';
import { ArticleService } from './services/article.service';
import { ArticleRepository } from './repositories/article.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../../entities/article.entity';
import { KnowledgeBaseCategoryRepository } from './repositories/knowledge-base-category.repository';
import { Category } from '../../entities/knowledge-base-category.entity';
import { KnowledgeBaseCategoryService } from './services/category.services';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Category])],
  providers: [
    KnowledgeBaseAndHelpResolver,
    ArticleService,
    ArticleRepository,
    KnowledgeBaseCategoryRepository,
    KnowledgeBaseCategoryService,
  ],
})
export class KnowledgeBaseAndHelpModule {}
