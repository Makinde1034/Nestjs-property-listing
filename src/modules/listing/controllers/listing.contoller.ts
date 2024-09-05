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
import { LocationDto } from '../../location/dto/request/location.dto';

@Controller('listing')
export class ListingController {
  constructor(private listingService: ListingService) {}
  @Post('listing-image-upload')
  // @UseGuards(RestAccessTokenGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async uploadListingImage(
    @Query('listingId') listingId: string,
    @Query('imageId') imageId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('lng') lng?: number,
    @Query('lat') lat?: number,
  ) {
    const locationDto = {
      lat: lat,
      lng: lng,
    };
    return await this.listingService.uploadListingImage(
      listingId,
      imageId,
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
