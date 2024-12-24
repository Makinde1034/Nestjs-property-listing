/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ListingService } from '../services/listing.service';
import {
  AdminAuctionFilter,
  AdminFilterAndSort,
  CompareListingInput,
  CreateListingDto,
  FlagListingInput,
  ListingActionApprovalInput,
  ListingActionInput,
  UpdateListingDto,
} from '../dtos/request/';

import { Listing } from '../../../entities';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';

import {
  AdminListingResponse,
  AuctionParticipantResponse,
  AuctionResponse,
  FlaggedListingResponse,
  ListingResponse,
  OfferOwnerResponse,
  OfferResponse,
  SearchHistoryResponse,
} from '../dtos/response/listing.response';
import { OfferService } from '../services/offer.service';
import {
  CreateOfferDto,
  FindOfferInput,
  UpdateOfferInput,
} from '../dtos/request/offer-input';
import { Offer } from '../../../entities/offer.entity';

import { AttributeDto } from '../dtos/request/attributes.dto';
import { CreatePromotionInput } from '../dtos/request/promotion-input';
import { Promotion } from '../../../entities/promotion.entity';

import { CreateSearchHistoryInput } from '../dtos/request/create-search-history';

import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { CreateFeatureInput } from '../dtos/request/feature-input';
import { Feature } from '../../../entities/feature.entity';
import { WishlistService } from '../services/wishlist.service';
import { Wishlist } from '../../../entities/wishlist.entity';
import { CreateWishlistInput } from '../dtos/request/wishlistInput';
import {
  AuctionActionInput,
  CreateAuctionInput,
  CreateAuctionParticipantInput,
  FetchAuctionParticipantInput,
  UpdateAuctionInput,
} from '../dtos/request/auction-input';
import { AuctionService } from '../services/auction.service';
import { Auction } from '../../../entities/auction-table.entity';
import { AuctionParticipant } from '../../../entities/auction-participant.entity';
import { ListingAttributes } from '../../../entities/listing-attributes.entity';
import { ListingAttributeService } from '../services/listing-attributes.service';
import { SuccessResponse } from '../../../common/utils/success.response';
import { FlagListing } from '../../../entities/flag-listing.entity';
import {
  BidRegistrationInput,
  CreateBidInput,
  FindBidInput,
} from '../dtos/request/bids';
import { Bids } from '../../../entities/bids.entity';
import { AutoBid } from '../../../entities/auto-bid.entity';
import { CreateAutoBidInput } from '../dtos/request/auto-bid';
import { Public } from '../../auth/decorators/permision.decorator';
import { UserTwoGuard } from '../../auth/guards/level-two.guard';
import { Compare } from '../../../entities/compare.entity';
import { Permissions } from '../../../common/decorator/permission';
import { PermissionsEnum } from '../../../common/enums/permission.enum';
import { BidRegistration } from '../../../entities/bid-registration.entity';
import { AuctionBidRange } from '../../../entities/auction-bid-range.entity';

@Resolver()
export class ListingResolver {
  constructor(
    private listingService: ListingService,
    private readonly offerService: OfferService,
    private readonly wishlistService: WishlistService,
    private readonly auctionService: AuctionService,
    private readonly listingAttributeService: ListingAttributeService,
  ) {}

  /*************************
   * Create Listing
   *************************/

  @UseGuards(AccessTokenGuard, UserTwoGuard)
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

  @Query(() => ListingResponse, {
    name: 'findAllListingForBuyerUnauthenticated',
  })
  @Public()
  async findListingForBuyer(
    @Args('findManyOptions', { nullable: true })
    findManyOptions?: CreateSearchHistoryInput,
  ) {
    const { listing, total } =
      await this.listingService.findAllListingForBuyerUnauthenticated(
        findManyOptions,
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
    return await this.listingService.findAllListingsForOwner(
      findManyOptions,
      ctx.req.user,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => [Listing], { name: 'compareListing' })
  async compareListing(
    @Args('compareListingInput')
    compareListingInput: CompareListingInput,
    @Context() ctx: any,
  ) {
    return await this.listingService.compareListings(
      compareListingInput,
      ctx.req.user,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => Compare, { name: 'findCompare', nullable: true })
  async findCompare(@Context() ctx: any) {
    return await this.listingService.fetchCompare(ctx.req.user);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => Listing, { name: 'findOneListingForOwner' })
  async findOneListingForOwner(
    @Context() ctx: any,
    @Args('id')
    id: string,
  ) {
    const listing = await this.listingService.findOneListingForOwner(
      id,
      ctx.req.user,
    );
    return listing;
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.LISTINGS_VIEW_DETAILS)
  @Public()
  @Query(() => AdminListingResponse, { name: 'findListingsForAdmin' })
  async getListingsForAdmin(
    @Args('paginateAndSort', { nullable: true })
    paginateAndSort: AdminFilterAndSort,
  ) {
    const data = await this.listingService.getListingForAdmin(paginateAndSort);

    return data;
  }

  @Permissions(PermissionsEnum.LISTINGS_VIEW_DETAILS)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => Listing, { name: 'findOneListingForAdmin' })
  async getOneListingForAdmin(@Args('id') id: string) {
    return await this.listingService.getOneListingForAdmin(id);
  }

  @Permissions(PermissionsEnum.LISTINGS_VIEW_DETAILS)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => SuccessResponse, { name: 'unfeatureAListing' })
  async unfeatureAListing(@Args('id') id: string, @Context() ctx: any) {
    return await this.listingService.unfeatureAListing(id, ctx.req.user);
  }
  // @Permissions(PermissionsEnum.AUCTIONS_READ)
  // @UseGuards(AccessTokenGuard, PermissionsGuard)
  // @Query(() => [String], { name: 'getAllUsersForParticipant' })
  // async getAllUsersForParticipant(@Args('id') id: string) {
  //   return await this.auctionService.getAllUsersForParticipant(id);
  // }

  @UseGuards(AccessTokenGuard)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => Listing, { name: 'findOneListingForAuthenticatedBuyer' })
  async findOneForBuyer(@Args('id') id: string) {
    return await this.listingService.findOneListingForBuyer(id);
  }
  @Public()
  @Query(() => Listing, { name: 'findOneForUnauthenticatedBuyer' })
  async findOneForUnauthenticatedBuyer(@Args('id') id: string) {
    return await this.listingService.findOneListingForBuyerUnauthenticated(id);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => ListingResponse, { name: 'findListingForBuyerAuthenticated' })
  async findListingForBuyerAuthenticated(
    @Context() ctx: any,
    @Args('findManyOptions', { nullable: true })
    findManyOptions?: CreateSearchHistoryInput,
  ) {
    const { listing, total } =
      await this.listingService.findListingForBuyerAuthenticated(
        findManyOptions,
        ctx.req.user,
      );
    return { listing, total };
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
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

  @Query(() => [ListingAttributes], { name: 'fetchListingAttribute' })
  @Public()
  async fetchListingAttribute(@Args('listingId') listingId: string) {
    return await this.listingAttributeService.findListingAttribute(listingId);
  }

  @Query(() => FlaggedListingResponse, {
    nullable: true,
    name: 'viewFlaggedListings',
  })
  @Permissions(PermissionsEnum.LISTINGS_MULTI_ACTIONS)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async viewFlaggedListings(
    @Args('findManyOptions', { nullable: true })
    findManyOptions?: PaginateAndSort,
  ) {
    return await this.listingService.viewFlaggedListing(findManyOptions);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.LISTINGS_MULTI_ACTIONS)
  @Query(() => FlagListing, {
    nullable: true,
    name: 'flaggedListing',
  })
  @Permissions(PermissionsEnum.LISTINGS_MULTI_ACTIONS)
  async flaggedListings(
    @Args('id')
    listingId: string,
  ) {
    return await this.listingService.flaggedListing(listingId);
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

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => SuccessResponse, {
    nullable: true,
    name: 'getMessageInLocalLanguage',
  })
  getMessageInLocalLanguage(@Context() ctx: any) {
    return this.listingService.shareListing(ctx.req.user);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.LISTINGS_DELETE)
  @Mutation(() => SuccessResponse, { name: 'deleteListing' })
  async deleteListing(
    @Context() ctx: any,
    @Args('listingId') listingId: string,
  ) {
    return await this.listingService.deleteListing(ctx.req.user, listingId);
  }

  // @UseGuards(AccessTokenGuard, PermissionsGuard)
  // @Permissions(PermissionsEnum.LISTINGS_CREATE)
  @Public()
  @Mutation(() => SuccessResponse, { name: 'approveListing' })
  async approveListing(
    @Context() ctx: any,
    @Args('listingActionInput') listingActionInput: ListingActionApprovalInput,
  ) {
    return await this.listingService.approveListing(
      listingActionInput,
      ctx.req.user,
    );
  }
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.LISTINGS_CREATE)
  @Mutation(() => SuccessResponse, { name: 'rejectListing' })
  async rejectListing(
    @Context() ctx: any,
    @Args('listingActionInput') listingActionInput: ListingActionApprovalInput,
  ) {
    return await this.listingService.rejectListing(
      listingActionInput,
      ctx.req.user,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => SearchHistoryResponse, {
    nullable: true,
    name: 'getSearchHistory',
  })
  async getSearchHistory(
    @Context() ctx: any,
    @Args('paginateAndSort', { nullable: true })
    paginateAndSort: PaginateAndSort,
  ) {
    return await this.listingService.getSearchHistory(
      ctx.req.user.id,
      paginateAndSort,
    );
  }

  /*************************
   *Offer
   * ************************/

  @UseGuards(AccessTokenGuard, PermissionsGuard, UserTwoGuard)
  @Mutation(() => Offer, { name: 'createOffer', nullable: true })
  async createOffer(
    @Args('createOfferDto') createOfferDto: CreateOfferDto,
    @Context() ctx: any,
  ) {
    return await this.offerService.createAnOffer(createOfferDto, ctx.req.user);
  }
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => Offer, { name: 'finalizeOffer', nullable: true })
  async finalizeOffer(@Args('id') id: string) {
    return await this.offerService.finalizeOffer(id);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => Offer, { name: 'getLastOfferPrice', nullable: true })
  async getLastOfferPrice(@Args('listingId') listingId: string) {
    return await this.offerService.getLastOfferPrice(listingId);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => Offer, { name: 'updateOffer', nullable: true })
  async updateOffer(
    @Args('updateOfferInput') updateOfferInput: UpdateOfferInput,

    @Context() ctx: any,
  ) {
    return await this.offerService.updateOffer(ctx.req.user, updateOfferInput);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => Offer, { name: 'acceptOffer', nullable: true })
  async acceptOffer(
    @Args('updateOfferInput') updateOfferInput: UpdateOfferInput,
    @Context() ctx: any,
  ) {
    return await this.offerService.acceptOffer(ctx.req.user, updateOfferInput);
  }
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => Offer, { name: 'rejectOffer', nullable: true })
  async rejectOffer(
    @Args('updateOfferInput') updateOfferInput: UpdateOfferInput,
    @Context() ctx: any,
  ) {
    return await this.offerService.rejectOffer(ctx.req.user, updateOfferInput);
  }
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => Offer, { name: 'findOneOffer' })
  async findOne(@Args('id') id: string) {
    return await this.offerService.findOne(id);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => OfferResponse, { name: 'findOffers' })
  async findManyOffers(@Args('findOptions') paginateAndSort: FindOfferInput) {
    return await this.offerService.findMany(paginateAndSort);
  }
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => OfferOwnerResponse, { name: 'findManyForOwner' })
  async findManyForOwner(
    @Args('findOptions') paginateAndSort: FindOfferInput,
    @Context() ctx: any,
  ) {
    return await this.offerService.findManyForOwner(
      paginateAndSort,
      ctx.req.user,
    );
  }
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => SuccessResponse)
  async cancelOffer(@Args('id') id: string) {
    return await this.offerService.deleteOffer(id);
  }

  /**************************
   *
   *Promotion
   *
   *************************/

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => Promotion, { name: 'createPromotion' })
  async createPromotion(
    @Args('createPromotionInput') createPromotionInput: CreatePromotionInput,
  ) {
    return await this.listingService.createPromotion(createPromotionInput);
  }

  /*************************
   * WISHLIST
   *************************/
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => Wishlist, { name: 'addToWishlist' })
  async addToWishist(
    @Args('createWishlistInput') createWishlistInput: CreateWishlistInput,
    @Context() ctx: any,
  ) {
    return await this.wishlistService.create(createWishlistInput, ctx.req.user);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => SuccessResponse, { name: 'removeFromWishlist' })
  async removeFromWishlist(@Args('wishlistId') wishlistId: string) {
    return await this.wishlistService.delete(wishlistId);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => [Wishlist], { name: 'getWishlist' })
  async getUserWishlist(@Context() ctx: any) {
    return await this.wishlistService.getWishList(ctx.req.user);
  }

  /*******************************************
   *
   * ADMIN
   *
   ********************************************/

  @Permissions(PermissionsEnum.LISTINGS_VIEW_DETAILS)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => Listing, { name: 'findOneListingsForAdmin' })
  async getOneListingsForAdmin(@Args('listingId') listingId: string) {
    return await this.listingService.getOneListingForAdmin(listingId);
  }

  @Permissions(PermissionsEnum.LISTINGS_MULTI_ACTIONS)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => SuccessResponse, { name: 'adminDisableListing' })
  async adminDisableListing(
    @Args('listingActionInput') listingActionInput: ListingActionInput,
  ) {
    return await this.listingService.disableListing(listingActionInput);
  }
  @Permissions(PermissionsEnum.LISTINGS_MULTI_ACTIONS)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => SuccessResponse, { name: 'enableListing' })
  async adminEnableListing(
    @Args('listingActionInput') listingActionInput: ListingActionInput,
    @Context() ctx: any,
  ) {
    return await this.listingService.enableListing(
      listingActionInput,
      ctx.req.user,
    );
  }
  @Permissions(PermissionsEnum.LISTINGS_DELETE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => SuccessResponse, { name: 'deleteListing' })
  async adminDeleteListing(
    @Context() ctx: any,
    @Args('listingId') listingId: string,
  ) {
    return await this.listingService.deleteListing(ctx.req.user, listingId);
  }

  @Permissions(PermissionsEnum.LISTINGS_MULTI_ACTIONS)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => Feature, { name: 'createFeature' })
  async createFeature(
    @Args('createFeatureInput') createFeatureInput: CreateFeatureInput,
    @Context() ctx: any,
  ) {
    return await this.listingService.featureAListing(
      createFeatureInput,
      ctx.req.user,
    );
  }

  /**********************************
   * Auction
   **********************************/

  @Permissions(PermissionsEnum.AUCTIONS_CREATE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => Auction, { name: 'createAuction' })
  async createAuction(
    @Args('createAuctionInput') createAuction: CreateAuctionInput,
  ) {
    return await this.auctionService.create(createAuction);
  }

  @Permissions(PermissionsEnum.AUCTIONS_EDIT)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => Auction, { name: 'updateAuction' })
  async updateAuction(
    @Args('updateAuctionInput') updateAuctionInput: UpdateAuctionInput,
    @Context() ctx: any,
  ) {
    return await this.auctionService.update(updateAuctionInput, ctx.req.user);
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => Auction, { name: 'getAuction' })
  async findOneAuction(
    @Args('id')
    id: string,
  ) {
    return await this.auctionService.findOne(id);
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => AuctionParticipantResponse, {
    name: 'findOneAuctionWithParticipant',
  })
  async findOneAuctionWithParticipant(
    @Args('fetchAuctionParticipantInput')
    fetchAuctionParticipantInput: FetchAuctionParticipantInput,
  ) {
    return await this.auctionService.findOneAuctionWithParticipants(
      fetchAuctionParticipantInput,
    );
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => AuctionResponse, { name: 'getAllRunningAuction' })
  async getAllRunningAuction(
    @Args('findManyOption') paginateAndSort: PaginateAndSort,
  ) {
    return await this.auctionService.findAllRunning(paginateAndSort);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => AuctionResponse, { name: 'getAllUpcomingAuction' })
  async getAllUpcomingAuction(
    @Args('findManyOption') paginateAndSort: PaginateAndSort,
  ) {
    return await this.auctionService.findAllUpcoming(paginateAndSort);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.AUCTIONS_READ)
  @Query(() => AuctionResponse, { name: 'getAllAuction' })
  async getAllAuction(
    @Args('findManyOption') findManyOption: AdminAuctionFilter,
  ) {
    return await this.auctionService.findAll(findManyOption);
  }

  @Permissions(PermissionsEnum.AUCTIONS_DELETE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => SuccessResponse, { name: 'deleteAuction' })
  async deleteAuction(
    @Args('auctionActionInput') auctionActionInput: AuctionActionInput,
    @Context() ctx: any,
  ) {
    return await this.auctionService.delete(auctionActionInput, ctx.req.user);
  }

  @Permissions(PermissionsEnum.AUCTIONS_STATUS_DEACTIVATE_REACTIVATE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => SuccessResponse, { name: 'reactivateAuction' })
  async reactivateAuction(
    @Args('auctionActionInput') auctionActionInput: AuctionActionInput,
    @Context() ctx: any,
  ) {
    return await this.auctionService.reactivateAuction(
      auctionActionInput,
      ctx.req.user,
    );
  }

  @Permissions(PermissionsEnum.AUCTIONS_STATUS_DEACTIVATE_REACTIVATE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => SuccessResponse, { name: 'cancleAuction' })
  async cancleAuction(
    @Args('auctionActionInput') auctionActionInput: AuctionActionInput,
    @Context() ctx: any,
  ) {
    return await this.auctionService.cancleAuction(
      auctionActionInput,
      ctx.req.user,
    );
  }

  /********************************
   * Aution Participant
   *******************************/

  @UseGuards(AccessTokenGuard)
  @Mutation(() => AuctionParticipant, { name: 'addAuctionParticipant' })
  async createAuctionParticipant(
    @Args('createAuctionParticipantInput')
    addParticipantToAuctionInput: CreateAuctionParticipantInput,
  ) {
    return await this.auctionService.addListingToAuction(
      addParticipantToAuctionInput,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => AuctionParticipantResponse, { name: 'getListingsAuction' })
  async getListingsAuction(
    @Args('findManyOption') paginateAndSort: PaginateAndSort,
  ) {
    return await this.auctionService.getParticipantOfAuction(paginateAndSort);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => SuccessResponse, { name: 'deleteSavedHistory' })
  async deleteSavedHistory(@Args('id') id: string) {
    return await this.listingService.deleteSavedHistory(id);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => SuccessResponse, { name: 'unpublishAListing' })
  async unPublishListing(@Args('id') id: string, @Context() ctx: any) {
    return await this.listingService.unPublishListing(id, ctx.req.user);
  }
  @UseGuards(AccessTokenGuard)
  @Mutation(() => SuccessResponse, { name: 'publishAListing' })
  async publishListing(@Args('id') id: string, @Context() ctx: any) {
    return await this.listingService.publishListing(id, ctx.req.user);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => SuccessResponse, { name: 'stopPromotion' })
  async stopPromotion(@Args('id') id: string, @Context() ctx: any) {
    return await this.listingService.stopPromotion(id, ctx.req.user);
  }

  @UseGuards(AccessTokenGuard, UserTwoGuard)
  @Mutation(() => Bids, { name: 'createBid' })
  async createBid(
    @Args('createBidInput') createBidInput: CreateBidInput,
    @Context() ctx: any,
  ) {
    return await this.auctionService.bidOnAuction(createBidInput, ctx.req.user);
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => [Bids], { name: 'findNewestBid' })
  async findNewestBid(@Args('findBidInput') findBidInput: FindBidInput) {
    return await this.auctionService.fetchBidsOnAuction(findBidInput);
  }

  @UseGuards(AccessTokenGuard, UserTwoGuard)
  @Mutation(() => AutoBid, { name: 'autoBidOnAuction' })
  async createAutoBidOnAuction(
    @Args('createAutoBidInput') createAutoBidInput: CreateAutoBidInput,
    @Context() ctx: any,
  ) {
    return await this.auctionService.createAutoBidOnAuction(
      createAutoBidInput,
      ctx.req.user,
    );
  }

  @UseGuards(AccessTokenGuard, UserTwoGuard)
  @Mutation(() => BidRegistration, { name: 'registerToBid' })
  async registerToBid(
    @Args('bidRegistrationInput') bidRegistrationInput: BidRegistrationInput,
    @Context() ctx: any,
  ) {
    return await this.auctionService.registerToBid(
      bidRegistrationInput,
      ctx.req.user,
    );
  }

  @UseGuards(AccessTokenGuard, UserTwoGuard)
  @Query(() => [AuctionBidRange], { name: 'bidRange' })
  async bidRange() {
    return await this.auctionService.bidRange();
  }

  @Query(() => [Listing], { name: 'searchForListing' })
  @UseGuards(AccessTokenGuard)
  async searchForListing(@Args('searchParam') searchParam: string) {
    return await this.listingService.searchForListing(searchParam);
  }

  @Query(() => [Auction], { name: 'searchForAuction' })
  @UseGuards(AccessTokenGuard)
  async searchForAuction(@Args('searchParam') searchParam: string) {
    return await this.listingService.searchForListing(searchParam);
  }
}
