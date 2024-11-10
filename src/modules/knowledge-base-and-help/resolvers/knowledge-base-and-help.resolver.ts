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
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';
import { CategoryResponse } from '../dto/response/category';
import { PermissionsEnum } from '../../../common/enums/permission.enum';
import { Permissions } from '../../../common/decorator/permission';
import { Public } from '../../auth/decorators/permision.decorator';

@Resolver(() => Article)
export class KnowledgeBaseAndHelpResolver {
  constructor(
    private readonly articleService: ArticleService,
    private readonly knowledgeBaseCategoryService: KnowledgeBaseCategoryService,
  ) {}

  @Mutation(() => Category)
  @Permissions(PermissionsEnum.CMS_CATEGORIES_CREATE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async createCategory(
    @Args('createCategoryInput')
    createCategoryInput: CreateCategoryInput,
  ) {
    return await this.knowledgeBaseCategoryService.createCategory(
      createCategoryInput,
    );
  }

  @Query(() => CategoryResponse, { name: 'findAllcategories' })
  async findAll(
    @Args('findOption', { nullable: true }) findOption: CategoryFilterInput,
  ) {
    return await this.knowledgeBaseCategoryService.findAll(findOption);
  }

  @Query(() => String, { name: 'placement' })
  async placement() {
    return await this.knowledgeBaseCategoryService.placement();
  }

  @Query(() => Category, { name: 'findOneCategory' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return await this.knowledgeBaseCategoryService.findOne(id);
  }

  @Mutation(() => Category, { name: 'updateCategory' })
  @Permissions(PermissionsEnum.CMS_CATEGORIES_EDIT)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async updateKnowledgeBaseCategory(
    @Args('updateCategoryInput')
    updateCategoryInput: UpdateCategoryInput,
  ) {
    return await this.knowledgeBaseCategoryService.update(updateCategoryInput);
  }

  @Mutation(() => SuccessResponse, { name: 'deleteCategory' })
  @Permissions(PermissionsEnum.CMS_CATEGORIES_DELETE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async removeKnowledgeBaseCatecory(
    @Args('categoryActionInput') categoryActionInput: CategoryActionInput,
  ) {
    return await this.knowledgeBaseCategoryService.delete(categoryActionInput);
  }

  @Mutation(() => Article)
  @Permissions(PermissionsEnum.CMS_CREATE_CONTENT)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async createArticle(
    @Args('createArticleInput')
    createArticleInput: CreateArticleInput,
    @Context() ctx: any,
  ) {
    return await this.articleService.create(createArticleInput, ctx.req.user);
  }
  @UseGuards(AccessTokenGuard)
  @Query(() => ArticleResponse, { name: 'findManyArticles' })
  async findManyArticles(@Args('findOption') findOption: ArticleFilterInput) {
    return await this.articleService.findAll(findOption);
  }

  @Public()
  @Query(() => ArticleResponse, { name: 'findManyArticlesCustomer' })
  async findManyArticlesCustomer(
    @Args('findOption') findOption: ArticleFilterInput,
  ) {
    return await this.articleService.findAll(findOption);
  }
  @UseGuards(AccessTokenGuard)
  @Query(() => ArticleResponse, { name: 'findManyArticlesKnowledgeBase' })
  async findAllKnowledgeBase(
    @Args('findOption') findOption: ArticleFilterInput,
  ) {
    return await this.articleService.findAllKnowledgeBase(findOption);
  }

  @Query(() => Article, { name: 'findOneArticle' })
  async findOneArticle(@Args('id', { type: () => Int }) id: number) {
    return await this.articleService.findOne(id);
  }
  @Query(() => Article, { name: 'findOneArticleCustomer' })
  @Public()
  async findOneArticleCustomer(@Args('id', { type: () => Int }) id: number) {
    return await this.articleService.findOne(id);
  }

  @Mutation(() => SuccessResponse, { name: 'publishArticle' })
  @Permissions(PermissionsEnum.CMS_CREATE_CONTENT)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async publish(
    @Args('articlePublishInput') articlePublishInput: ArticlePublishInput,
  ) {
    return await this.articleService.publish(articlePublishInput);
  }

  @Mutation(() => SuccessResponse, { name: 'unpublishArticle' })
  @Permissions(PermissionsEnum.CMS_CREATE_CONTENT)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async unPublish(
    @Args('articlePublishInput') articlePublishInput: ArticlePublishInput,
  ) {
    return await this.articleService.unpublish(articlePublishInput);
  }

  @Mutation(() => SuccessResponse)
  @Permissions(PermissionsEnum.CMS_DELETE_CONTENT)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async deleteArticle(
    @Args('articleDeleteInput') articleDeleteInput: ArticleDeleteInput,
  ) {
    return await this.articleService.remove(articleDeleteInput);
  }

  @Mutation(() => Article)
  @Permissions(PermissionsEnum.CMS_EDIT_CONTENT)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
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

  @Query(() => [Article], { name: 'searchForArticles' })
  @UseGuards(AccessTokenGuard)
  async searchForArticles(@Args('searchParam') searchParam: string) {
    return await this.articleService.searchForArticles(searchParam);
  }

  @Query(() => [Article], { name: 'searchForArticlesKnowledgeBase' })
  @UseGuards(AccessTokenGuard)
  async searchForArticlesKnowledgeBase(
    @Args('searchParam') searchParam: string,
  ) {
    return await this.articleService.searchForArticlesKnowledgeBase(
      searchParam,
    );
  }
}
