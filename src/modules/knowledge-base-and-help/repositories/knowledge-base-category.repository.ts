import { DataSource, Repository } from 'typeorm';
import { Category } from '../../../entities/knowledge-base-category.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
export class KnowledgeBaseCategoryRepository extends Repository<Category> {
  constructor(private dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }
}
