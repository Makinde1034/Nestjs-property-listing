/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ListingService } from '../services/listing.service';
import {
  AdminFilterAndSort,
  CreateListingDto,
  FlagListingInput,
  UpdateListingAdminDto,
  UpdateListingDto,
} from '../dtos/request/';

import { Listing } from '../../../entities';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards';

import {
  AdminListingResponse,
  AuctionResponse,
  FlaggedListingResponse,
  ListingResponse,
  OfferResponse,
} from '../dtos/response/listing.response';
import { OfferService } from '../services/offer.service';
import {
  CreateOfferDto,
  FindOfferInput,
  UpdateOfferInput,
} from '../dtos/request/offer-input';
import { Offer } from '../../../entities/offer.entity';
import { Amenities } from '../../../entities/amenities.entity';
import { AttributeDto } from '../dtos/request/attributes.dto';
import { CreatePromotionInput } from '../dtos/request/promotion-input';
import { Promotion } from '../../../entities/promotion.entity';

import { AdminGuard } from '../../auth/guards/admin.guard';

import { SuccessResponse } from '../../../common/response';
import { CreateSearchHistoryInput } from '../dtos/request/create-search-history';
import { SearchHistory } from '../../../entities/search-history.entity';

import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { CreateFeatureInput } from '../dtos/request/feature-input';
import { Feature } from '../../../entities/feature.entity';
import { WishlistService } from '../services/wishlist.service';
import { Wishlist } from '../../../entities/wishlist.entity';
import { CreateWishlistInput } from '../dtos/request/wishlistInput';
import {
  CreateAuctionInput,
  UpdateAuctionInput,
} from '../dtos/request/auction-input';
import { AuctionService } from '../services/auction.service';
import { Auction } from '../../../entities/auction-table.entity';

@Resolver()
export class ListingResolver {
  constructor(
    private listingService: ListingService,
    private readonly offerService: OfferService,
    private readonly wishlistService: WishlistService,
    private readonly auctionService: AuctionService,
  ) {}

  /*************************
   * Create Listing
   *************************/
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

  /*************************
   * Find Listing
   *************************/

  // @UseGuards(AccessTokenGuard)
  @Query(() => ListingResponse, { name: 'findListingsForBuyer' })
  async findListingForBuyer(
    @Args('findManyOptions', { nullable: true })
    findManyOptions?: CreateSearchHistoryInput,
  ) {
    const [listing, total] =
      await this.listingService.findAllListings(findManyOptions);

    return { listing, total };
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => ListingResponse, { name: 'findPromotedListings' })
  async findPromotedListingForBuyer(
    @Context() ctx: any,
    @Args('findManyOptions', { nullable: true })
    findManyOptions?: CreateSearchHistoryInput,
  ) {
    const [listing, total] =
      await this.listingService.authenticatedFindAllListings(
        findManyOptions,
        ctx.req.user,
      );

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
  // @UseGuards(AdminGuard)
  @Query(() => FlaggedListingResponse, {
    nullable: true,
    name: 'viewFlaggedListings',
  })
  async viewFlaggedListings(
    @Args('findManyOptions', { nullable: true })
    findManyOptions?: PaginateAndSort,
  ) {
    return await this.listingService.viewFlaggedListing({
      skip: findManyOptions.skip,
      take: findManyOptions.take,
    });
  }

  /*************************
   *Offer
   *************************/

  @UseGuards(AccessTokenGuard)
  @Mutation(() => Offer, { name: 'createOffer', nullable: true })
  async createOffer(
    @Args('createOfferDto') createOfferDto: CreateOfferDto,
    @Context() ctx: any,
  ) {
    return await this.offerService.createAnOffer(createOfferDto, ctx.req.user);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => Offer, { name: 'updateOffer', nullable: true })
  async updateOffer(
    @Args('updateOfferInput') updateOfferInput: UpdateOfferInput,

    @Context() ctx: any,
  ) {
    return await this.offerService.updateOffer(ctx.req.user, updateOfferInput);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => Offer, { name: 'acceptOffer', nullable: true })
  async acceptOffer(
    @Args('updateOfferInput') updateOfferInput: UpdateOfferInput,
    @Context() ctx: any,
  ) {
    return await this.offerService.acceptOffer(ctx.req.user, updateOfferInput);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => Offer, { name: 'rejectOffer', nullable: true })
  async rejectOffer(
    @Args('updateOfferInput') updateOfferInput: UpdateOfferInput,
    @Context() ctx: any,
  ) {
    return await this.offerService.rejectOffer(ctx.req.user, updateOfferInput);
  }

  @Query(() => Offer, { name: 'findOneOffer' })
  async findOne(@Args('id') id: string) {
    return await this.offerService.findOne(id);
  }

  @Query(() => OfferResponse, { name: 'findOffers' })
  async findMany(@Args('findOptions') paginateAndSort: FindOfferInput) {
    return await this.offerService.findMany(paginateAndSort);
  }

  @Query(() => [Amenities], { name: 'findAmenities', nullable: true })
  async findAmenities(
    @Args('listingType', { nullable: true }) listingType: string,
  ) {
    return await this.listingService.findAmenities(listingType);
  }
  /*************************
   *Promotion
   *************************/

  @UseGuards(AccessTokenGuard)
  @Mutation(() => Promotion, { name: 'createPromotion' })
  async createPromotion(
    @Args('createPromotionInput') createPromotionInput: CreatePromotionInput,
  ) {
    return await this.listingService.createPromotion(createPromotionInput);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => SuccessResponse, { name: 'flagListing' })
  async flagListing(
    @Context() ctx: any,
    @Args('flagListingInput') flaglistingInput: FlagListingInput,
  ) {
    return await this.listingService.flagListing(
      flaglistingInput,
      ctx.req.user.id,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => SuccessResponse, {
    nullable: true,
    name: 'getMessageInLocalLanguage',
  })
  getMessageInLocalLanguage(@Context() ctx: any) {
    return this.listingService.shareListing(ctx.req.user);
  }

  @UseGuards(AccessTokenGuard)
  @UseGuards(AdminGuard)
  @Mutation(() => SuccessResponse, { name: 'deleteListing' })
  async deleteListing(@Args('listingId') listingId: string) {
    return await this.listingService.deleteListing(listingId);
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => [SearchHistory], {
    nullable: true,
    name: 'getSearchHistory',
  })
  async getSearchHistory(@Context() ctx: any) {
    return await this.listingService.getSearchHistory(ctx.req.user.id);
  }

  @UseGuards(AdminGuard)
  @UseGuards(AccessTokenGuard)
  @Query(() => Listing, { name: 'findOneListingsForAdmin' })
  async getOneListingsForAdmin(@Args('listingId') listingId: string) {
    return await this.listingService.getOneListingForAdmin(listingId);
  }

  @UseGuards(AdminGuard)
  @UseGuards(AccessTokenGuard)
  @Query(() => AdminListingResponse, { name: 'findListingsForAdmin' })
  async getListingsForAdmin(
    @Args('paginateAndSort') paginateAndSort: AdminFilterAndSort,
  ) {
    return await this.listingService.getListingForAdmin(paginateAndSort);
  }

  // @UseGuards(AdminGuard)
  // @UseGuards(AccessTokenGuard)
  // @Mutation(() => Listing, { name: 'adminUpdateListing' })
  async adminUpdateListing(
    @Args('adminUpdateListingDto') updateListingDto: UpdateListingAdminDto,
  ) {
    return await this.listingService.editListingForAdmin(updateListingDto);
  }

  @UseGuards(AdminGuard)
  @UseGuards(AccessTokenGuard)
  @Mutation(() => SuccessResponse, { name: 'adminDisableListing' })
  async adminDisableListing(@Args('listingId') listingId: string) {
    return await this.listingService.disableListing(listingId);
  }
  @UseGuards(AdminGuard)
  @UseGuards(AccessTokenGuard)
  @Mutation(() => SuccessResponse, { name: 'enableListing' })
  async adminEnableListing(@Args('listingId') listingId: string) {
    return await this.listingService.enableListing(listingId);
  }
  @UseGuards(AdminGuard)
  @UseGuards(AccessTokenGuard)
  @Mutation(() => SuccessResponse, { name: 'deleteListing' })
  async adminDeleteListing(@Args('listingId') listingId: string) {
    return await this.listingService.deleteListing(listingId);
  }

  @UseGuards(AdminGuard)
  @UseGuards(AccessTokenGuard)
  @Mutation(() => Feature, { name: 'createFeature' })
  async createFeature(
    @Args('createFeatureInput') createFeatureInput: CreateFeatureInput,
  ) {
    return await this.listingService.featureAListing(createFeatureInput);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => Wishlist, { name: 'addToWishlist' })
  async addToWishist(
    @Args('createWishlistInput') createWishlistInput: CreateWishlistInput,
    @Context() ctx: any,
  ) {
    return await this.wishlistService.create(createWishlistInput, ctx.req.user);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => SuccessResponse, { name: 'removeFromWishlist' })
  async removeFromWishlist(@Args('wishlistId') wishlistId: string) {
    return await this.wishlistService.delete(wishlistId);
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => [Wishlist], { name: 'getWishlist' })
  async getUserWishlist(@Context() ctx: any) {
    return await this.wishlistService.getWishList(ctx.req.user);
  }

  @UseGuards(AdminGuard)
  @UseGuards(AccessTokenGuard)
  @Mutation(() => Auction, { name: 'createAuction' })
  async createAuction(
    @Args('createAuctionInput') createAuction: CreateAuctionInput,
  ) {
    return await this.auctionService.create(createAuction);
  }

  @UseGuards(AdminGuard)
  @UseGuards(AccessTokenGuard)
  @Mutation(() => Auction, { name: 'updateAuction' })
  async updateAuction(
    @Args('updateAuctionInput') updateAuctionInput: UpdateAuctionInput,
  ) {
    return await this.auctionService.update(updateAuctionInput);
  }
  @UseGuards(AdminGuard)
  @UseGuards(AccessTokenGuard)
  @Query(() => Auction, { name: 'getAuction' })
  async findOneAuction(@Args('id') id: string) {
    return await this.auctionService.findOne(id);
  }
  @UseGuards(AdminGuard)
  @UseGuards(AccessTokenGuard)
  @Query(() => AuctionResponse, { name: 'getAllAuction' })
  async findManyAuction(
    @Args('findManyOptions') paginateAndSort: PaginateAndSort,
  ) {
    return await this.auctionService.findAll(paginateAndSort);
  }

  @UseGuards(AdminGuard)
  @UseGuards(AccessTokenGuard)
  @Mutation(() => Auction, { name: 'id' })
  async deleteAuction(@Args('id') id: string) {
    return await this.auctionService.delete(id);
  }
}
