/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ListingTypeService } from '../services/listing-type.service';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';
import {
  ListingTypeInput,
  ListingTypeUpdateInput,
  ListingTypeDeleteInput,
} from '../dtos/request';
import { ListingType } from '../../../entities';
import { Permissions } from 'src/common/decorator/permission';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { ListingTypesResponse } from '../dtos/response/listingType.response';
import { Public } from '../../auth/decorators/permision.decorator';

@Resolver()
export class ListingTypeResolver {
  constructor(private readonly listingTypeService: ListingTypeService) {}

  /**
   * Fetch ListingTypes
   *
   * @async
   * @returns {Promise<ListingType[]>}
   */ @Public()
  @Query(() => ListingTypesResponse)
  async fetchListingTypes(
    @Args('findOptions', { nullable: true }) findOptions: PaginateAndSort,
  ) {
    return await this.listingTypeService.findAllListingTypes(findOptions);
  }
  @Public()
  @Query(() => ListingType)
  async fetchOneListingTypes(@Args('id') id: string): Promise<ListingType> {
    return await this.listingTypeService.findOne(id);
  }

  /**
   * Create ListingType
   *
   * @async
   * @param {ListingType} RequestInput
   * @returns {Promise<ListingType>}
   */
  @Mutation(() => ListingType)
  @Permissions('create-listing-type')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async createListingType(
    @Args('RequestInput') RequestInput: ListingTypeInput,
    @Context() ctx: any,
  ): Promise<ListingType> {
    RequestInput.englishName = RequestInput.englishName.toLocaleLowerCase();
    return await this.listingTypeService.createListingType(
      RequestInput,
      ctx.req.user,
    );
  }

  /**
   * Update ListingType
   *
   * @async
   * @param {ListingTypeUpdateInput} RequestInput
   * @returns {Promise<ListingType>}
   */
  @Mutation(() => ListingType)
  @Permissions('update-listing-type')
  @UseGuards(AccessTokenGuard, AdminGuard)
  async updateListingType(
    @Args('RequestInput') RequestInput: ListingTypeUpdateInput,
    @Context() ctx: any,
  ): Promise<ListingType> {
    return await this.listingTypeService.updateListingType(
      RequestInput,
      ctx.req.user,
    );
  }

  /**
   * Delete ListingType
   *
   * @async
   * @param {ListingTypeDeleteInput} RequestInput
   * @returns {Promise<string>}
   */
  @Mutation(() => String)
  @Permissions('delete-listing-type')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async deleteListingType(
    @Args('RequestInput') RequestInput: ListingTypeDeleteInput,
    @Context() ctx: any,
  ): Promise<string> {
    return await this.listingTypeService.deleteListingType(
      RequestInput,
      ctx.req.user,
    );
  }

  @Query(() => [ListingType], { name: 'searchForListingType' })
  @UseGuards(AccessTokenGuard)
  async searchForListingType(@Args('searchParam') searchParam: string) {
    return await this.listingTypeService.searchForListingType(searchParam);
  }
}
