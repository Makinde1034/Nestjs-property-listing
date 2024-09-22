/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ListingAttributeRepository } from '../repositories/listing-attributes.repository';
import { AppStrings } from '../../../common/messages/app.strings';
@Injectable()
export class ListingAttributeService {
  constructor(private listingAttributeRepository: ListingAttributeRepository) {}
  logger = new Logger(ListingAttributeService.name);
  async findListingAttribute(id: string) {
    try {
      const listingAttributes = await this.listingAttributeRepository.find({
        where: { listing: { id } },
      });

      if (!listingAttributes) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }
      return listingAttributes;
    } catch (error) {
      this.logger.log(error);
    }
  }
}
