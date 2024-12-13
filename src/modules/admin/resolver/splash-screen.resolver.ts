/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SplashScreen } from '../../../entities/splash-screen.entity';
import {
  CreateSplashScreenInput,
  UpdateSplashScreenInput,
} from '../dto/request/create-splash-screen';
import { SplashScreenService } from '../services/splash-screen.service';
import { SplashScreenResponse } from '../dto/response/splash-screen-response';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';
import {
  DeleteSplashScreenInput,
  SplashScreenFilterInput,
} from '../dto/request/admin-request';
import { SuccessResponse } from '../../../common/utils/success.response';
import { Permissions } from '../../../common/decorator/permission';
import { PermissionsEnum } from '../../../common/enums/permission.enum';

@Resolver()
export class SplashScreenResolver {
  constructor(private readonly splashScreenService: SplashScreenService) {}
  @Mutation(() => SuccessResponse, { name: 'createSplashScreen' })
  @Permissions(PermissionsEnum.KNOWLEDGE_BASE_CREATE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async create(
    @Args('createSplashScreenInput')
    createSplashScreenInput: CreateSplashScreenInput,
    @Context() ctx: any,
  ) {
    return await this.splashScreenService.create(
      createSplashScreenInput,
      ctx.req.user,
    );
  }

  @Permissions(PermissionsEnum.KNOWLEDGE_BASE_READ)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => SplashScreenResponse, { name: 'findAllSplashScreen' })
  async findAll(
    @Args('findOption', { nullable: true }) findOption: SplashScreenFilterInput,
  ) {
    return await this.splashScreenService.findAll(findOption);
  }
  @Permissions(PermissionsEnum.KNOWLEDGE_BASE_READ)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => SplashScreen, { name: 'findOneSplashScreen' })
  async findOne(@Args('id') id: number) {
    return await this.splashScreenService.findOne(id);
  }
  @Permissions(PermissionsEnum.KNOWLEDGE_BASE_EDIT)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => SuccessResponse, { name: 'updateSplashScreen' })
  async update(
    @Args('updateSplashScreenInput')
    updateSplashScreenInput: UpdateSplashScreenInput,
    @Context() ctx: any,
  ) {
    return await this.splashScreenService.update(
      updateSplashScreenInput,
      ctx.req.user,
    );
  }
  @Permissions(PermissionsEnum.KNOWLEDGE_BASE_DELETE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => SuccessResponse, { name: 'deleteSplashScreen' })
  async delete(
    @Args('deleteSplashScreenInput')
    deleteSplashScreenInput: DeleteSplashScreenInput,
    @Context() ctx: any,
  ) {
    return await this.splashScreenService.delete(
      deleteSplashScreenInput,
      ctx.req.user,
    );
  }

  @Query(() => SplashScreen, {
    name: 'findDefaultSplashScreen',
    nullable: true,
  })
  async findDefault() {
    return await this.splashScreenService.fetchDefault();
  }

  @Query(() => SplashScreen, {
    name: 'findDefaultBanner',
    nullable: true,
  })
  async findDefaultBanner() {
    return await this.splashScreenService.fetchDefaultForBanner();
  }

  @Permissions(PermissionsEnum.KNOWLEDGE_BASE_READ)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => [SplashScreen], { name: 'searchForSplashScreen' })
  @UseGuards(AccessTokenGuard)
  async searchForSplashScreen(@Args('searchParam') searchParam: string) {
    return await this.splashScreenService.searchForSplashScreen(searchParam);
  }
}
