import { Resolver, Mutation, Args } from '@nestjs/graphql';

import { Article } from '../../../entities/article.entity';
import { ArticleService } from '../services/article.service';
import { CreateArticleInput } from '../dto/article.input';

@Resolver(() => Article)
export class KnowledgeBaseAndHelpResolver {
  constructor(private readonly articleService: ArticleService) {}

  @Mutation(() => Article)
  createKnowledgeBaseAndHelp(
    @Args('createKnowledgeBaseAndHelpInput')
    CreateArticleInput: CreateArticleInput,
  ) {
    return this.articleService.create(CreateArticleInput);
  }

  // @Query(() => [KnowledgeBaseAndHelp], { name: 'knowledgeBaseAndHelp' })
  // findAll() {
  //   return this.knowledgeBaseAndHelpService.findAll();
  // }

  // @Query(() => KnowledgeBaseAndHelp, { name: 'knowledgeBaseAndHelp' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.knowledgeBaseAndHelpService.findOne(id);
  // }

  // @Mutation(() => KnowledgeBaseAndHelp)
  // updateKnowledgeBaseAndHelp(
  //   @Args('updateKnowledgeBaseAndHelpInput')
  //   updateKnowledgeBaseAndHelpInput: UpdateKnowledgeBaseAndHelpInput,
  // ) {
  //   return this.knowledgeBaseAndHelpService.update(
  //     updateKnowledgeBaseAndHelpInput.id,
  //     updateKnowledgeBaseAndHelpInput,
  //   );
  // }

  // @Mutation(() => KnowledgeBaseAndHelp)
  // removeKnowledgeBaseAndHelp(@Args('id', { type: () => Int }) id: number) {
  //   return this.knowledgeBaseAndHelpService.remove(id);
  // }
}
