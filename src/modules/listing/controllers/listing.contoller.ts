/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Body,
  Controller,
  Delete,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ListingService } from '../services/listing.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { RestAccessTokenGuard } from '../../auth/guards';
import {
  AuctionListingImageInput,
  ListingImageFormDataInput,
  ListingImageInput,
} from '../dtos/request';
import { AuctionService } from '../services/auction.service';

@Controller('listing')
export class ListingController {
  constructor(
    private readonly listingService: ListingService,
    private readonly auctionService: AuctionService,
  ) {}
  @Post('listing-image-upload')
  @UseGuards(RestAccessTokenGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async uploadListingImage(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() feature: ListingImageFormDataInput,
    @Query() query: ListingImageInput,
  ) {
    return await this.listingService.uploadListingImage(feature, query, files);
  }

  @Post('auction-image-upload')
  @UseGuards(RestAccessTokenGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async uploadAuctionListingImage(
    @Query() query: AuctionListingImageInput,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.auctionService.uploadAuctionImage(query.id, files);
  }

  @Post('panorama-listing-image-upload')
  @UseGuards(RestAccessTokenGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async uploadPanoramaListingImage(
    @Query('listingId') listingId: string,
    @Query('imageId') imageId: string,
    @UploadedFiles() file: Express.Multer.File[],
    @Body() feature: ListingImageFormDataInput,
  ) {
    return await this.listingService.uploadPanoramaImage(
      listingId,
      file,
      imageId,
      feature,
    );
  }

  @Delete('delete-listing-image')
  @UseGuards(RestAccessTokenGuard)
  async deleteListingImage(
    @Query('listingId') listingId: string,
    @Query('imageId') imageId: string[],
  ) {
    return await this.listingService.deleteListingImage(listingId, imageId);
  }
}
