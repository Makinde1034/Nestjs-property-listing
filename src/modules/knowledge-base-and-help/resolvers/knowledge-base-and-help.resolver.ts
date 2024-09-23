import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { KnowledgeBaseAndHelp } from '../../../entities/knowledge-base-and-help.entity';
import { CreateKnowledgeBaseAndHelpInput } from '../dto/create-knowledge-base-and-help.input';
import { UpdateKnowledgeBaseAndHelpInput } from '../dto/update-knowledge-base-and-help.input';
import { KnowledgeBaseAndHelpService } from '../services/knowledge-base-and-help.service';

@Resolver(() => KnowledgeBaseAndHelp)
export class KnowledgeBaseAndHelpResolver {
  constructor(
    private readonly knowledgeBaseAndHelpService: KnowledgeBaseAndHelpService,
  ) {}

  @Mutation(() => KnowledgeBaseAndHelp)
  createKnowledgeBaseAndHelp(
    @Args('createKnowledgeBaseAndHelpInput')
    createKnowledgeBaseAndHelpInput: CreateKnowledgeBaseAndHelpInput,
  ) {
    return this.knowledgeBaseAndHelpService.create(
      createKnowledgeBaseAndHelpInput,
    );
  }

  @Query(() => [KnowledgeBaseAndHelp], { name: 'knowledgeBaseAndHelp' })
  findAll() {
    return this.knowledgeBaseAndHelpService.findAll();
  }

  @Query(() => KnowledgeBaseAndHelp, { name: 'knowledgeBaseAndHelp' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.knowledgeBaseAndHelpService.findOne(id);
  }

  @Mutation(() => KnowledgeBaseAndHelp)
  updateKnowledgeBaseAndHelp(
    @Args('updateKnowledgeBaseAndHelpInput')
    updateKnowledgeBaseAndHelpInput: UpdateKnowledgeBaseAndHelpInput,
  ) {
    return this.knowledgeBaseAndHelpService.update(
      updateKnowledgeBaseAndHelpInput.id,
      updateKnowledgeBaseAndHelpInput,
    );
  }

  @Mutation(() => KnowledgeBaseAndHelp)
  removeKnowledgeBaseAndHelp(@Args('id', { type: () => Int }) id: number) {
    return this.knowledgeBaseAndHelpService.remove(id);
  }
}
