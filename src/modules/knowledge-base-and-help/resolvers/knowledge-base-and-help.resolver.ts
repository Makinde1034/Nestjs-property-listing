/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';

import { Article } from '../../../entities/article.entity';
import { ArticleService } from '../services/article.service';
import {
  ArticleFilterInput,
  ArticlePublishInput,
  CreateArticleInput,
  UpdateArticleInput,
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
    createCategoryInput: CreateCategoryInput,
  ) {
    return await this.knowledgeBaseCategoryService.createCategory(
      createCategoryInput,
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
    return await this.knowledgeBaseCategoryService.findOne(id);
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
    createArticleInput: CreateArticleInput,
  ) {
    return await this.articleService.create(createArticleInput);
  }

  @Query(() => ArticleResponse, { name: 'findManyArticles' })
  async findManyArticles(@Args('findOption') placement: ArticleFilterInput) {
    return await this.articleService.findAll(placement);
  }

  @Query(() => Article, { name: 'findOneArticle' })
  async findOneArticle(@Args('id', { type: () => Int }) id: number) {
    return await this.articleService.findOne(id);
  }

  @Query(() => SuccessResponse, { name: 'publishArticle' })
  async publish(
    @Args('articlePublishInput') articlePublishInput: ArticlePublishInput,
  ) {
    return await this.articleService.publish(articlePublishInput);
  }

  @Query(() => SuccessResponse, { name: 'unpublishArticle' })
  async unPublish(
    @Args('articlePublishInput') articlePublishInput: ArticlePublishInput,
  ) {
    return await this.articleService.unpublish(articlePublishInput);
  }

  @Mutation(() => SuccessResponse)
  async delete(@Args('id') id: number) {
    return await this.articleService.remove(id);
  }

  @Mutation(() => Article)
  async updateArticle(
    @Args('updateArticleInput') updateArticleInput: UpdateArticleInput,
  ) {
    return await this.articleService.update(updateArticleInput);
  }
}
