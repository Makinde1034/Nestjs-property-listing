/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ListingTypeService } from '../services/listing-type.service';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards';
import {
  ListingTypeInput,
  ListingTypeUpdateInput,
  ListingTypeDeleteInput,
} from '../dtos';
import { ListingType } from '../../../entities';

@Resolver()
export class ListingTypeResolver {
  constructor(private readonly listingTypeService: ListingTypeService) {}

  /**
   * Fetch ListingTypes
   *
   * @async
   * @returns {Promise<ListingType[]>}
   */
  @Query(() => [ListingType])
  @UseGuards(AccessTokenGuard)
  async fetchListingTypes(): Promise<ListingType[]> {
    return await this.listingTypeService.findAllListingTypes();
  }

  /**
   * Create ListingType
   *
   * @async
   * @param {ListingType} RequestInput
   * @returns {Promise<ListingType>}
   */
  @Mutation(() => ListingType)
  @UseGuards(AccessTokenGuard)
  async createListingType(
    @Args('RequestInput') RequestInput: ListingTypeInput,
  ): Promise<ListingType> {
    return await this.listingTypeService.createListingType(RequestInput);
  }

  /**
   * Update ListingType
   *
   * @async
   * @param {ListingTypeUpdateInput} RequestInput
   * @returns {Promise<ListingType>}
   */
  @Mutation(() => ListingType)
  @UseGuards(AccessTokenGuard)
  async updateListingType(
    @Args('RequestInput') RequestInput: ListingTypeUpdateInput,
  ): Promise<ListingType> {
    return await this.listingTypeService.updateListingType(RequestInput);
  }

  /**
   * Delete ListingType
   *
   * @async
   * @param {ListingTypeDeleteInput} RequestInput
   * @returns {Promise<string>}
   */
  @Mutation(() => String)
  @UseGuards(AccessTokenGuard)
  async deleteListingType(
    @Args('RequestInput') RequestInput: ListingTypeDeleteInput,
  ): Promise<string> {
    return await this.listingTypeService.deleteListingType(RequestInput);
  }
}
