import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeBaseAndHelpResolver } from './knowledge-base-and-help.resolver';
import { ArticleService } from '../services/article.service';

describe('KnowledgeBaseAndHelpResolver', () => {
  let resolver: KnowledgeBaseAndHelpResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnowledgeBaseAndHelpResolver, ArticleService],
    }).compile();

    resolver = module.get<KnowledgeBaseAndHelpResolver>(
      KnowledgeBaseAndHelpResolver,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
