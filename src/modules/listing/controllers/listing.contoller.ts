/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Controller,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ListingService } from '../services/listing.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { RestAccessTokenGuard } from '../../auth/guards';

@Controller('listing')
export class ListingController {
  constructor(private listingService: ListingService) {}

  @Post('listing-image-upload')
  @UseGuards(RestAccessTokenGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async uploadListingImage(
    @Query('listingId') listingId: string,
    @Query('imageId') imageId: string,

    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.listingService.uploadListingImage(
      listingId,
      imageId,
      files,
    );
  }

  @Post('panorama-listing-image-upload')
  @UseGuards(RestAccessTokenGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async uploadPanoramaListingImage(
    @Query('listingId') listingId: string,
    @Query('imageId') imageId: string,
    @UploadedFiles() file: Express.Multer.File,
  ) {
    console.log(file);
    return await this.listingService.uploadPanoramaImage(
      listingId,
      file,
      imageId,
    );
  }
}
