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
import { AccessTokenGuard } from '../../auth/guards';

@Resolver()
export class SplashScreenResolver {
  constructor(private readonly splashScreenService: SplashScreenService) {}
  @Mutation(() => SplashScreen, { name: 'createSplashScreen' })
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

  @Query(() => SplashScreenResponse, { name: 'findAllSplashScreen' })
  async findAll(
    @Args('findOption', { nullable: true }) findOption: PaginateAndSort,
  ) {
    return await this.splashScreenService.findAll(findOption);
  }

  @Query(() => SplashScreen, { name: 'findOneSplashScreen' })
  async findOne(@Args('id') id: number) {
    return await this.splashScreenService.findOne(id);
  }

  @Mutation(() => SplashScreen, { name: 'updateSplashScreen' })
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

  @Mutation(() => SplashScreen, { name: 'deleteSplashScreen' })
  async delete(id: number) {
    return await this.splashScreenService.delete(id);
  }

  @Query(() => SplashScreen, {
    name: 'findDefaultSplashScreen',
    nullable: true,
  })
  async findDefault() {
    return await this.splashScreenService.fetchDefault();
  }

  @Query(() => [SplashScreen], { name: 'searchForSplashScreen' })
  @UseGuards(AccessTokenGuard)
  async searchForSplashScreen(@Args('searchParam') searchParam: string) {
    return await this.splashScreenService.searchForSplashScreen(searchParam);
  }
}
