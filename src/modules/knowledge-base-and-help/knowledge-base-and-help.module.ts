import { Module } from '@nestjs/common';
import { KnowledgeBaseAndHelpResolver } from './resolvers/knowledge-base-and-help.resolver';
import { KnowledgeBaseAndHelpService } from './services/knowledge-base-and-help.service';

@Module({
  providers: [KnowledgeBaseAndHelpResolver, KnowledgeBaseAndHelpService],
})
export class KnowledgeBaseAndHelpModule {}
