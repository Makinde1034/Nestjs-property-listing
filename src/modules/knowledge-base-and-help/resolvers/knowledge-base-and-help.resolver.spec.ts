import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeBaseAndHelpResolver } from './knowledge-base-and-help.resolver';
import { KnowledgeBaseAndHelpService } from './knowledge-base-and-help.service';

describe('KnowledgeBaseAndHelpResolver', () => {
  let resolver: KnowledgeBaseAndHelpResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnowledgeBaseAndHelpResolver, KnowledgeBaseAndHelpService],
    }).compile();

    resolver = module.get<KnowledgeBaseAndHelpResolver>(KnowledgeBaseAndHelpResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
