/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AdPackageService } from '../services/ad-package.service';
import { AdPackage } from '../../../entities/ad-package.entity';
import { CreateAdPackageInput } from '../dto/create-ad-package.input';
import { UpdateAdPackageInput } from '../dto/update-ad-package.input';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards';
import { AdminGuard } from '../../auth/guards/admin.guard';

@UseGuards(AccessTokenGuard)
@Resolver(() => AdPackage)
export class AdPackageResolver {
  constructor(private readonly adPackageService: AdPackageService) {}

  // @UseGuards(AdminGuard)
  @Mutation(() => AdPackage)
  async createAdPackage(
    @Args('createAdPackageInput') createAdPackageInput: CreateAdPackageInput,
  ) {
    return await this.adPackageService.create(createAdPackageInput);
  }
  @UseGuards(AccessTokenGuard)
  @Query(() => [AdPackage], { name: 'adPackage' })
  async findAll() {
    return await this.adPackageService.findAll();
  }
  @UseGuards(AccessTokenGuard)
  @Query(() => AdPackage, { name: 'adPackage' })
  async findOne(@Args('id', { type: () => String }) id: string) {
    return await this.adPackageService.findOne(id);
  }
  @UseGuards(AccessTokenGuard)
  @UseGuards(AdminGuard)
  @Mutation(() => AdPackage)
  async updateAdPackage(
    @Args('updateAdPackageInput') updateAdPackageInput: UpdateAdPackageInput,
  ) {
    return await this.adPackageService.update(
      updateAdPackageInput.id,
      updateAdPackageInput,
    );
  }
  @UseGuards(AccessTokenGuard)
  @UseGuards(AdminGuard)
  @Mutation(() => AdPackage)
  async removeAdPackage(@Args('id', { type: () => Int }) id: number) {
    return await this.adPackageService.remove(id);
  }
}
