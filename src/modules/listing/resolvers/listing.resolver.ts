/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ListingService } from '../services/listing.service';
import { CreateListingDto, UpdateListingDto } from '../dtos/request/';

import { Listing } from '../../../entities';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards';

import { ListingResponse } from '../dtos/response/listing.response';
import { OfferService } from '../services/offer.service';
import { CreateOfferDto } from '../dtos/request/offer.dto';
import { Offer } from '../../../entities/offer.entity';
import { Amenities } from '../../../entities/amenities.entity';
import { AttributeDto } from '../dtos/request/attributes.dto';
import { CreatePromotionInput } from '../dtos/request/promotion-input';
import { Promotion } from '../../../entities/promotion.entity';

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
  @Query(() => ListingResponse, { name: 'findListings' })
  async findListingForBuyer(
    @Args('findManyOptions', { nullable: true })
    findManyOptions?: AttributeDto,
  ) {
    const [listing, total] =
      await this.listingService.findAllListings(findManyOptions);

    return { listing, total };
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => ListingResponse, { name: 'findPromotedListings' })
  async findPromotedListingForBuyer(
    @Args('findManyOptions', { nullable: true })
    findManyOptions?: AttributeDto,
  ) {
    const [listing, total] =
      await this.listingService.findAllPromotedListings(findManyOptions);

    return { listing, total };
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => ListingResponse, { name: 'findListingsForOwner' })
  async findListingsForOwner(
    @Context() ctx: any,
    @Args('findManyOptions', { nullable: true })
    findManyOptions?: AttributeDto,
  ) {
    const [listing, total] = await this.listingService.findAllListingsForOwner(
      findManyOptions,
      ctx.req.user,
    );

    return { listing, total };
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => Listing, { name: 'findOneForBuyer' })
  async findOneForBuyer(@Args('id') id: string) {
    return await this.listingService.findOneListingForBuyer(id);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => Listing, { name: 'updateListing' })
  async updateListing(
    @Args('updateListingDto') updateListingDto: UpdateListingDto,
    @Context() ctx: any,
  ) {
    return await this.listingService.updateListing(
      updateListingDto,
      ctx.req.user,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => Offer, { name: 'createOffer' })
  async createOffer(
    @Args('createOfferDto') createOfferDto: CreateOfferDto,
    @Context() ctx: any,
  ) {
    return await this.offerService.createAnOffer(createOfferDto, ctx.req.user);
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => [Amenities], { name: 'findAmenities' })
  async findAmenities() {
    return await this.listingService.findAmenities();
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => Promotion, { name: 'createPromotion' })
  async createPromotion(
    @Args('createPromotionInput') createPromotionInput: CreatePromotionInput,
  ) {
    return await this.listingService.createPromotion(createPromotionInput);
  }
}
