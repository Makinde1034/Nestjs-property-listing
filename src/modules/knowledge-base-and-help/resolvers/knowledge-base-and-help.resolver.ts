import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';

import { Article } from '../../../entities/article.entity';
import { ArticleService } from '../services/article.service';
import {
  ArticleFilterInput,
  CreateArticleInput,
} from '../dto/request/article.input';
import { Category } from '../../../entities/knowledge-base-category.entity';
import { KnowledgeBaseCategoryService } from '../services/category.services';
import {
  CategoryFilterInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../dto/request/knowledg-base.category.input';
import { SuccessResponse } from '../../../common/utils/success.response';
import { ArticleResponse } from '../dto/response/article';

@Resolver(() => Article)
export class KnowledgeBaseAndHelpResolver {
  constructor(
    private readonly articleService: ArticleService,
    private readonly knowledgeBaseCategoryService: KnowledgeBaseCategoryService,
  ) {}

  @Mutation(() => Category)
  async createCategory(
    @Args('createCategoryInput')
    CreateArticleInput: CreateCategoryInput,
  ) {
    return await this.knowledgeBaseCategoryService.createCategory(
      CreateArticleInput,
    );
  }

  @Query(() => [Category], { name: 'categories' })
  async findAll(
    @Args('findOption', { nullable: true }) findOption: CategoryFilterInput,
  ) {
    return await this.knowledgeBaseCategoryService.findAll(findOption);
  }

  @Query(() => Category, { name: 'knowledgeBaseCategory' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.knowledgeBaseCategoryService.findOne(id);
  }

  @Mutation(() => Category)
  async updateKnowledgeBaseCatecory(
    @Args('updateKnowledgeBaseCategoryInput')
    updateKnowledgeBaseAndHelpInput: UpdateCategoryInput,
  ) {
    return await this.knowledgeBaseCategoryService.update(
      updateKnowledgeBaseAndHelpInput,
    );
  }

  @Mutation(() => SuccessResponse)
  async removeKnowledgeBaseCatecory(
    @Args('id', { type: () => Int }) id: number,
  ) {
    return await this.knowledgeBaseCategoryService.delete(id);
  }

  @Mutation(() => Article)
  async createArticle(
    @Args('createArticleInput')
    CreateArticleInput: CreateArticleInput,
  ) {
    return await this.articleService.create(CreateArticleInput);
  }

  @Query(() => ArticleResponse, { name: 'findManyArticles' })
  async findManyArticles(@Args('findOption') placement: ArticleFilterInput) {
    return this.articleService.findAll(placement);
  }

  @Query(() => Article, { name: 'findOneArticle' })
  async findOneArticle(@Args('id', { type: () => Int }) id: number) {
    return this.articleService.findOne(id);
  }
}
