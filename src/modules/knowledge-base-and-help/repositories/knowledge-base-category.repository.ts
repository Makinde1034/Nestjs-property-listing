import { DataSource, Repository } from 'typeorm';
import { KnowledgeBaseCategory } from '../../../entities/knowledge-base-category.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
export class KnowledgeBaseCategoryRepository extends Repository<KnowledgeBaseCategory> {
  constructor(private dataSource: DataSource) {
    super(KnowledgeBaseCategory, dataSource.createEntityManager());
  }
}
