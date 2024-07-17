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
import {
  CreateOfferDto,
  FindOfferInput,
  UpdateOfferInput,
} from '../dtos/request/offer-input';
import { OfferRepository } from '../repositories';
import { Listing, User } from '../../../entities';
import { PaymentService } from '../../payment/services/payment.service';
import { MoreThanOrEqual } from 'typeorm';
import { ListingService } from './listing.service';
import { AppStrings } from '../../../common/messages/app.strings';

import { PdfInput } from '../../file-handler/dto/pdf.dto';
import { addDaysToDate } from '../../../common/utils/helper';

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

      const [minimumPrice, userId, listing] =
        await this.getMinimumOfferForAListingAndUser(createOfferDto.listingId);
      if (minimumPrice > createOfferDto.offerPrice) {
        throw new BadRequestException(
          `Minimum Offer must be greater than  ${minimumPrice}`,
        );
      }

      if (user.id == userId) {
        throw new BadRequestException(
          'The creator of a listing cannot create an offer on  that listing',
        );
      }

      createOfferDto.userId = user.id;
      createOfferDto.expireAt = new Date(addDaysToDate(new Date(), 1));

      const offerPayload = await this.offerRepository.create(createOfferDto);

      const data: PdfInput = {
        createdDate: `${offerPayload.createdAt.getDay()}-${offerPayload.createdAt.getMonth()}-${offerPayload.createdAt.getFullYear()}`,
        dueDate: `${offerPayload.expireAt.getDate()}-${offerPayload.expireAt.getMonth()}-${offerPayload.expireAt.getFullYear()}`,
        clientName: `${user.firstName} ${user.lastName}`,
        item: listing.listingType,
        type: 'invoice',
        price: offerPayload.offerPrice,
        totalPrice: offerPayload.offerPrice,
      };

      this.paymentService.invoice(data, user);
      this.paymentService.invoice(null, listing.user);

      return offerPayload;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.data || error?.message || error);
    }
  }

  async getMinimumOfferForAListingAndUser(
    listingId: string,
  ): Promise<[number, string, Listing]> {
    try {
      const listing =
        await this.listingService.findOneListingForBuyer(listingId);

      if (!listing) {
        throw new NotFoundException(AppStrings.LISTING_NOT_FOUND);
      }
      const minimumListingPrice = (80 / listing.price) * 100;
      const user = listing.userId;
      return [minimumListingPrice, user, listing];
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async findOne(id: string) {
    try {
      return await this.offerRepository.findByIdOrFail(id, ['listing']);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException();
    }
  }

  async findMany(findOfferInput: FindOfferInput) {
    try {
      const [offer, total] = await this.offerRepository.findAndCount({
        where: { listingId: findOfferInput.listingId },
        skip: findOfferInput.skip,
        take: findOfferInput.take,
      });

      return { offer, total };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException();
    }
  }
  async updateOffer(updateOfferInput: UpdateOfferInput) {
    try {
      const { id, ...rest } = updateOfferInput;

      const update = await this.offerRepository.update(id, rest);

      await this.paymentService.invoice()
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async acceptOffer(updateOfferInput: UpdateOfferInput) {
    try {
      const { id } = updateOfferInput;

      await this.paymentService.invoice()


      return await this.offerRepository.update(id, { status: 'accepted' });

      
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async rejectOffer(updateOfferInput: UpdateOfferInput) {
    try {
      const { id } = updateOfferInput;

      await this.paymentService.invoice()


      return await this.offerRepository.update(id, { status: 'rejected' });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
}
