import { Injectable } from '@nestjs/common';
import { CreateKnowledgeBaseAndHelpInput } from '../dto/create-knowledge-base-and-help.input';
import { UpdateKnowledgeBaseAndHelpInput } from '../dto/update-knowledge-base-and-help.input';
import { KnowledgeBaseAndHelpRepository } from '../repositories/knowledge-base.repository';

@Injectable()
export class Article {
  constructor(
    private readonly knowledgeBaseAndHelpRepository: KnowledgeBaseAndHelpRepository,
  ) {}
  create(createKnowledgeBaseAndHelpInput: CreateKnowledgeBaseAndHelpInput): Promise< {
    return 'This action adds a new knowledgeBaseAndHelp';
  }

  findAll() {
    return `This action returns all knowledgeBaseAndHelp`;
  }

  findOne(id: number) {
    return `This action returns a #${id} knowledgeBaseAndHelp`;
  }

  update(
    id: number,
    updateKnowledgeBaseAndHelpInput: UpdateKnowledgeBaseAndHelpInput,
  ) {
    return `This action updates a #${id} knowledgeBaseAndHelp`;
  }

  remove(id: number) {
    return `This action removes a #${id} knowledgeBaseAndHelp`;
  }
}
