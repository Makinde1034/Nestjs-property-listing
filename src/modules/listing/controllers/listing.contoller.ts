/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Controller,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ListingService } from '../services/listing.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('listing')
export class ListingController {
  constructor(private listingService: ListingService) {}

  @Post('listing-image-upload')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadListingImage(
    @Query('listingId') listingId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.listingService.uploadListingImage(listingId, files);
  }
}
