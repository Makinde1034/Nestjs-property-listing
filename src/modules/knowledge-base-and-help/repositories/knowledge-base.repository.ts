import { DataSource, Repository } from 'typeorm';
import { KnowledgeBaseAndHelp } from '../../../entities/knowledge-base-and-help.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KnowledgeBaseAndHelpRepository extends Repository<KnowledgeBaseAndHelp> {
  constructor(private dataSource: DataSource) {
    super(KnowledgeBaseAndHelp, dataSource.createEntityManager());
  }
}
