/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { ListingService } from '../services/listing.service';
import { CreateListingDto } from '../dtos/create-listing.dto';

import { Listing } from '../../../entities';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards';

@Resolver()
export class ListingResolver {
  constructor(private listingService: ListingService) {}
  @UseGuards(AccessTokenGuard)
  @Mutation(() => Listing, { name: 'createListing' })
  async createListing(
    @Args('createListing') createListingDto: CreateListingDto,
    @Context() ctx: any,
  ) {
    return await this.listingService.createListing(
      ctx.req.user,
      createListingDto,
    );
  }
}
