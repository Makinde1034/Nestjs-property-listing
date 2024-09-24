import { Module } from '@nestjs/common';
import { KnowledgeBaseAndHelpResolver } from './resolvers/knowledge-base-and-help.resolver';
import { ArticleService } from './services/article.service';
import { ArticleRepository } from './repositories/article.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../../entities/article.entity';
import { KnowledgeBaseCategoryRepository } from './repositories/knowledge-base-category.repository';
import { KnowledgeBaseCategory } from '../../entities/knowledge-base-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Article, KnowledgeBaseCategory])],
  providers: [
    KnowledgeBaseAndHelpResolver,
    ArticleService,
    ArticleRepository,
    KnowledgeBaseCategoryRepository,
  ],
})
export class KnowledgeBaseAndHelpModule {}
