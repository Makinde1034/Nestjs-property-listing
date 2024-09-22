/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
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
import { ListingImageInput } from '../dtos/request';

@Controller('listing')
export class ListingController {
  constructor(private listingService: ListingService) {}
  @Post('listing-image-upload')
  @UseGuards(RestAccessTokenGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async uploadListingImage(
    @Query() query: ListingImageInput,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const locationDto = {
      lat: query.lat,
      lng: query.lng,
    };
    return await this.listingService.uploadListingImage(
      query,

      files,
      locationDto,
    );
  }

  @Post('panorama-listing-image-upload')
  @UseGuards(RestAccessTokenGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async uploadPanoramaListingImage(
    @Query('listingId') listingId: string,
    @Query('imageId') imageId: string,
    @UploadedFiles() file: Express.Multer.File[],
  ) {
    return await this.listingService.uploadPanoramaImage(
      listingId,
      file,
      imageId,
    );
  }

  @Delete('delete-listing-image')
  // @UseGuards(RestAccessTokenGuard)
  async deleteListingImage(
    @Query('listingId') listingId: string,
    @Query('imageId') imageId: string[],
  ) {
    return await this.listingService.deleteListingImage(listingId, imageId);
  }
}
