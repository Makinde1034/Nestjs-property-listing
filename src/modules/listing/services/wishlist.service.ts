/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { WishlistRepository } from '../repositories/wishlist.repository';
import { AppStrings, messagesKeys } from '../../../common/messages/app.strings';
import { SuccessResponse } from '../../../common/utils/success.response';
import { User } from '../../../entities';
import { CreateWishlistInput } from '../dtos/request/wishlistInput';
import { ListingRepository } from '../repositories/listing.repository';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class WishlistService {
  constructor(
    private wishlistRepository: WishlistRepository,
    private listingRepository: ListingRepository,
    private readonly i18n: I18nService,
  ) {}

  logger = new Logger(WishlistRepository.name);

  async create(wishlistInput: CreateWishlistInput, user: User) {
    try {
      const listing = await this.listingRepository.findOne({
        where: { id: wishlistInput.listingId },
      });

      const wishlist = await this.wishlistRepository.save({
        listing,
        user,
      });
      return wishlist;
    } catch (error) {
      this.logger.log(error);

      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async delete(id: string) {
    try {
      const result = await this.wishlistRepository.softDelete(id);

      if (result.affected > 0) {
        return new SuccessResponse(
          this.i18n.t(`messages.${messagesKeys.DELETED_SUCCESSFULLY}`),
        );
      }
    } catch (error) {
      this.logger.log(error);

      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async getWishList(user: User) {
    try {
      return await this.wishlistRepository.find({
        where: { userId: user.id },
        relations: [
          'listing',
          'listing.listingAttributes.attribute',
          'listing.listingType',
        ],
      });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }
}
