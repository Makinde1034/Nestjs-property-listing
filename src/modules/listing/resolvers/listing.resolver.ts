/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ListingService } from '../services/listing.service';
import { CreateListingDto } from '../dtos/request/create-listing.dto';

import { Listing } from '../../../entities';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { ListingResponse } from '../dtos/response/listing.response';
import { OfferService } from '../services/offer.service';
import { CreateOfferDto } from '../dtos/request/create-offer.dto';
import { Offer } from '../../../entities/offer.entity';

@Resolver()
export class ListingResolver {
  constructor(
    private listingService: ListingService,
    private readonly offerService: OfferService,
  ) {}
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
  @UseGuards(AccessTokenGuard)
  @Query(() => ListingResponse, { name: 'findListingForBuyer' })
  async findListingForBuyer(
    @Args('findManyOptions', { nullable: true })
    findManyOptions?: PaginateAndSort,
  ) {
    const [listing, total] =
      await this.listingService.findAllListingForBuyer(findManyOptions);

    return { listing, total };
  }
  @UseGuards(AccessTokenGuard)
  @Query(() => Listing, { name: 'findOneForBuyer' })
  async findOneForBuyer(@Args('id') id: string) {
    return await this.listingService.findOneListingForBuyer(id);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => Offer, { name: 'createOffer' })
  async createOffer(@Args('createOfferDto') createOfferDto: CreateOfferDto) {
    return await this.offerService.createAnOffer(createOfferDto);
  }
}
