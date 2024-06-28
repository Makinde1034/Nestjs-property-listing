/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from '../dtos/request/offer.dto';
import { OfferRepository } from '../repositories';
import { User } from '../../../entities';
import { PaymentService } from '../../payment/services/payment.service';
import { MoreThanOrEqual } from 'typeorm';
import { ListingService } from './listing.service';
import { AppStrings } from '../../../common/messages/app.strings';
import { Offer } from '../../../entities/offer.entity';

import { PdfInput } from '../../file-handler/dto/pdf.dto';
@Injectable()
export class OfferService {
  constructor(
    private readonly offerRepository: OfferRepository,
    private paymentService: PaymentService,
    private listingService: ListingService,
  ) {}
  logger = new Logger(OfferService.name);
  async createAnOffer(createOfferDto: CreateOfferDto, user: User) {
    try {
      const offer = await this.offerRepository.findAll({
        where: {
          offerPrice: MoreThanOrEqual(createOfferDto.offerPrice),
          listingId: createOfferDto.listingId,
        },
        order: { offerPrice: 'DESC' },
      });
      if (offer.length > 0) {
        throw new BadRequestException(
          `Minimum Offer must be greater than ${offer[0].offerPrice}`,
        );
      }

      const minimumPrice = await this.getMinimumOfferForAListing(
        createOfferDto.listingId,
      );
      if (minimumPrice > createOfferDto.offerPrice) {
        throw new BadRequestException(
          `Minimum Offer must be greater than  ${minimumPrice}`,
        );
      }
      createOfferDto.userId = user.id;

      const offerPayload = await this.offerRepository.create(createOfferDto);

      const data: PdfInput = {
        createdDate: offerPayload.createdAt,
        dueDate: offerPayload.expireAt.toDateString(),
        clientName: `${user.firstName} ${user.lastName}`,
        type: 'invoice',
        price: offerPayload.offerPrice,
        totalPrice: offerPayload.offerPrice,
      };

      await this.paymentService.invoice(data, user);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.data || error?.message || error);
    }
  }

  async getMinimumOfferForAListing(listingId: string, offer?: Offer) {
    try {
      const listing =
        await this.listingService.findOneListingForBuyer(listingId);

      if (!listing) {
        throw new NotFoundException(AppStrings.LISTING_NOT_FOUND);
      }
      const minimumListingPrice = (80 / parseInt(listing.price)) * 100;

      return minimumListingPrice;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException();
    }
  }
}
