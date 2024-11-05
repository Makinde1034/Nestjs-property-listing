/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Resolver, Mutation, Args, Query, Int, Context } from '@nestjs/graphql';

import { Article } from '../../../entities/article.entity';
import { ArticleService } from '../services/article.service';
import {
  ArticleDeleteInput,
  ArticleFilterInput,
  ArticlePublishInput,
  CreateArticleInput,
  UpdateArticleInput,
} from '../dto/request/article.input';
import { Category } from '../../../entities/knowledge-base-category.entity';
import { KnowledgeBaseCategoryService } from '../services/category.services';
import {
  CategoryActionInput,
  CategoryFilterInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../dto/request/knowledg-base.category.input';
import { SuccessResponse } from '../../../common/utils/success.response';
import { ArticleResponse } from '../dto/response/article';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards';
import { CategoryResponse } from '../dto/response/category';

@Resolver(() => Article)
export class KnowledgeBaseAndHelpResolver {
  constructor(
    private readonly articleService: ArticleService,
    private readonly knowledgeBaseCategoryService: KnowledgeBaseCategoryService,
  ) {}

  @Mutation(() => Category)
  async createCategory(
    @Args('createCategoryInput')
    createCategoryInput: CreateCategoryInput,
  ) {
    return await this.knowledgeBaseCategoryService.createCategory(
      createCategoryInput,
    );
  }

  @Query(() => CategoryResponse, { name: 'categories' })
  async findAll(
    @Args('findOption', { nullable: true }) findOption: CategoryFilterInput,
  ) {
    return await this.knowledgeBaseCategoryService.findAll(findOption);
  }

  @Query(() => String, { name: 'placement' })
  async placement() {
    return await this.knowledgeBaseCategoryService.placement();
  }

  @Query(() => Category, { name: 'knowledgeBaseCategory' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return await this.knowledgeBaseCategoryService.findOne(id);
  }

  @Mutation(() => Category, { name: 'updateKnowledgeBaseCategory' })
  async updateKnowledgeBaseCategory(
    @Args('updateKnowledgeBaseCategoryInput')
    updateKnowledgeBaseAndHelpInput: UpdateCategoryInput,
  ) {
    return await this.knowledgeBaseCategoryService.update(
      updateKnowledgeBaseAndHelpInput,
    );
  }

  @Mutation(() => SuccessResponse, { name: 'deleteCategory' })
  async removeKnowledgeBaseCatecory(
    @Args('categoryActionInput') categoryActionInput: CategoryActionInput,
  ) {
    return await this.knowledgeBaseCategoryService.delete(categoryActionInput);
  }

  @Mutation(() => Article)
  async createArticle(
    @Args('createArticleInput')
    createArticleInput: CreateArticleInput,
    @Context() ctx: any,
  ) {
    return await this.articleService.create(createArticleInput, ctx.req.user);
  }

  @Query(() => ArticleResponse, { name: 'findManyArticles' })
  async findManyArticles(@Args('findOption') placement: ArticleFilterInput) {
    return await this.articleService.findAll(placement);
  }

  @Query(() => Article, { name: 'findOneArticle' })
  async findOneArticle(@Args('id', { type: () => Int }) id: number) {
    return await this.articleService.findOne(id);
  }
  @Mutation(() => SuccessResponse, { name: 'publishArticle' })
  async publish(
    @Args('articlePublishInput') articlePublishInput: ArticlePublishInput,
  ) {
    return await this.articleService.publish(articlePublishInput);
  }

  @Mutation(() => SuccessResponse, { name: 'unpublishArticle' })
  async unPublish(
    @Args('articlePublishInput') articlePublishInput: ArticlePublishInput,
  ) {
    return await this.articleService.unpublish(articlePublishInput);
  }

  @Mutation(() => SuccessResponse)
  async delete(
    @Args('articleDeleteInput') articleDeleteInput: ArticleDeleteInput,
  ) {
    return await this.articleService.remove(articleDeleteInput);
  }

  @Mutation(() => Article)
  async updateArticle(
    @Args('updateArticleInput') updateArticleInput: UpdateArticleInput,
    @Context() ctx: any,
  ) {
    return await this.articleService.update(updateArticleInput, ctx.req.user);
  }

  @Query(() => [Category], { name: 'searchForCategory' })
  @UseGuards(AccessTokenGuard)
  async searchForCategory(@Args('searchParam') searchParam: string) {
    return await this.knowledgeBaseCategoryService.searchForCategory(
      searchParam,
    );
  }
}
