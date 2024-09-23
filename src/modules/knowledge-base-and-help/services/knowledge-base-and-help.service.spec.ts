import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeBaseAndHelpService } from './knowledge-base-and-help.service';

describe('KnowledgeBaseAndHelpService', () => {
  let service: KnowledgeBaseAndHelpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnowledgeBaseAndHelpService],
    }).compile();

    service = module.get<KnowledgeBaseAndHelpService>(KnowledgeBaseAndHelpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
