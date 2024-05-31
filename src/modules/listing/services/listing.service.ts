/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ListingRepository } from '../repositories/listing.repository';
import { CreateListingDto } from '../dtos/create-listing.dto';
import { User } from '../../../entities';

@Injectable()
export class ListingService {
  constructor(private readonly listingRepository: ListingRepository) {}
  logger = new Logger(ListingService.name);
  async createListing(user: User, createListingDto: CreateListingDto) {
    try {
      createListingDto.userId = user.id;
      const listing = await this.listingRepository.create(createListingDto);

      return listing;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error.data || error.messages);
    }
  }
}
