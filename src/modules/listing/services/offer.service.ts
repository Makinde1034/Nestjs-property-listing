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
import { Listing, NotificationScope, User } from '../../../entities';
import { PaymentService } from '../../payment/services/payment.service';
import { MoreThanOrEqual } from 'typeorm';
import { ListingService } from './listing.service';
import { AppStrings } from '../../../common/messages/app.strings';

import { addDaysToDate } from '../../../common/utils/helper';
import { MailgunEmailService } from '../../mail/services/implementations';
import { getMessageData } from '../../../common/messages/alert-messages';
import { PdfInput } from '../../file-handler/dto/pdf.dto';
import {
  NotificationScopeRepository,
  UserRepository,
} from '../../user/repositories';
import { Purpose } from '../../../common/enums';

@Injectable()
export class OfferService {
  constructor(
    private readonly offerRepository: OfferRepository,
    private paymentService: PaymentService,
    private listingService: ListingService,
    private mailService: MailgunEmailService,
    private userRepository: UserRepository,
    private notificationRepository: NotificationScopeRepository,
  ) {}
  logger = new Logger(OfferService.name);

  async createAnOffer(createOfferDto: CreateOfferDto, user: User) {
    try {
      await this.listingService.findOneListingForBuyer(
        createOfferDto.listingId,
      );

      const offer = await this.offerRepository.findAll({
        where: {
          price: MoreThanOrEqual(createOfferDto.price),
          listingId: createOfferDto.listingId,
        },
        order: { price: 'DESC' },
      });

      const offerExpiry = new Date(createOfferDto.expireAt);

      const maxExpiry = new Date(addDaysToDate(new Date(), 2));

      if (offerExpiry > maxExpiry) {
        throw new BadRequestException('Max expiry is 2 days');
      }
      if (offer.length > 0) {
        throw new BadRequestException(
          `Minimum Offer must be greater than ${offer[0].price}`,
        );
      }

      const [minimumPrice, listing] =
        await this.getMinimumOfferForAListingAndUser(createOfferDto.listingId);
      if (minimumPrice > createOfferDto.price) {
        throw new BadRequestException(
          `Minimum Offer must be greater than  ${minimumPrice}`,
        );
      }

      if (user.id == listing.user.id) {
        // throw new BadRequestException(
        //   'The creator of a listing cannot create an offer on  that listing',
        // );
      }

      createOfferDto.userId = user.id;
      createOfferDto.expireAt = new Date(addDaysToDate(new Date(), 1));

      const offerPayload = await this.offerRepository.create(createOfferDto);

      const data: PdfInput = {
        createdDate: `${offerPayload.createdAt.getDate()}-${offerPayload.createdAt.getMonth() + 1}-${offerPayload.createdAt.getFullYear()}`,
        dueDate: `${offerPayload.expireAt.getDate()}-${offerPayload.expireAt.getMonth() + 1}-${offerPayload.expireAt.getFullYear()}`,
        clientName: `${user.firstName} ${user.lastName}`,

        rentingOption:
          listing.purpose === Purpose.SALE ? null : listing.rentingOption,
        type: listing.purpose === Purpose.SALE ? 'buy' : 'rent',
        price: offerPayload.price,
        totalPrice: offerPayload.price,
      };

      this.paymentService.invoice(data, user, listing);

      const seller = await this.userRepository.findById(listing.userId, [
        'notificationPreference',
      ]);

      const notificationPreference = await this.notificationRepository.find();

      const scope: NotificationScope = notificationPreference.find(
        (element) => {
          if (element.name == 'Create Offer') {
            return element;
          }
        },
      );

      const userPrefBuyer = user.notificationPreference.find((element) => {
        if (element.scope.id == scope.id) {
          return element;
        }
      });

      const userPrefSeller = seller.notificationPreference.find((element) => {
        if (element.scope.id == scope.id) {
          return element;
        }
      });

      if (userPrefBuyer?.email) {
        const mailMessageForBuyer = getMessageData(
          user.firstName,
          'Create',
          'Offers',
          'Offer Creator',
        );
        this.mailService.sendOfferMail({
          email: user.email,
          subject: mailMessageForBuyer[0]['Title'],
          text: mailMessageForBuyer[0]['Body'],
        });
      }

      if (userPrefSeller?.email) {
        const mailMessageForSeller = getMessageData(
          listing.user.arabicFirstName,
          'Create',
          'Offers',
          'Seller',
        );

        this.mailService.sendOfferMail({
          email: listing.user.email,
          subject: mailMessageForSeller[0]['Title'],
          text: mailMessageForSeller[0]['Body'],
        });
      }
      return offerPayload;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.data || error?.message || error);
    }
  }

  async getMinimumOfferForAListingAndUser(
    listingId: string,
  ): Promise<[number, Listing]> {
    try {
      const listing =
        await this.listingService.findOneListingForBuyer(listingId);

      if (!listing) {
        throw new NotFoundException(AppStrings.LISTING_NOT_FOUND);
      }
      const minimumListingPrice = (80 / listing.price) * 100;

      return [minimumListingPrice, listing];
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
  async updateOffer(user: User, updateOfferInput: UpdateOfferInput) {
    try {
      const { id, ...rest } = updateOfferInput;

      const [offer, allOffers] = await Promise.all([
        await this.offerRepository.findOne({
          where: { id: updateOfferInput.id },
          relations: ['listing.user'],
          select: {
            user: { email: true, firstName: true },
          },
        }),

        await this.offerRepository.findAll({
          where: {
            price: MoreThanOrEqual(updateOfferInput.price),
            listingId: updateOfferInput.listingId,
          },
          order: { price: 'DESC' },
        }),
      ]);

      if (allOffers.length > 0) {
        throw new BadRequestException(
          `Minimum Offer must be greater than ${allOffers[0].price}`,
        );
      }

      const [minimumPrice, listing] =
        await this.getMinimumOfferForAListingAndUser(
          updateOfferInput.listingId,
        );
      if (minimumPrice > updateOfferInput.price) {
        throw new BadRequestException(
          `Minimum Offer must be greater than  ${minimumPrice}`,
        );
      }

      if (user.id == listing.user.id) {
        throw new BadRequestException(
          'The creator of a listing cannot create an offer on  that listing',
        );
      }

      const mailMessageForBuyer = getMessageData(
        offer.user.firstName,
        'Update',
        'Offers',
        'Offer Creator',
      );
      const mailMessageForSeller = getMessageData(
        offer.listing.user.firstName,
        'Update',
        'Offers',
        'Seller',
      );

      const update = await this.offerRepository.update(id, rest);
      await this.mailService.sendOfferMail({
        email: offer.user.email,
        subject: mailMessageForBuyer[0]['Title'],
        text: mailMessageForBuyer[0]['Body'],
      });
      await this.mailService.sendOfferMail({
        email: offer.listing.user.email,
        subject: mailMessageForSeller[0]['Title'],
        text: mailMessageForSeller[0]['Body'],
      });
      return update;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async acceptOffer(user: User, updateOfferInput: UpdateOfferInput) {
    try {
      const { id } = updateOfferInput;

      const offer = await this.offerRepository.findOne({
        where: { id: id },
        relations: ['listing.user'],
        select: {
          user: { email: true, firstName: true },
        },
      });
      if (!offer) {
        throw new NotFoundException('Offer not found');
      }

      if (user.id != offer.listing.user.id) {
        throw new BadRequestException('Only the creator can accept an offer');
      }

      const update = await this.offerRepository.update(id, {
        status: 'accepted',
      });

      const mailMessageForBuyer = getMessageData(
        offer.user.firstName,
        'Accepted',
        'Offers',
        'Buyer',
      );
      const mailMessageForSeller = getMessageData(
        offer.listing.user.firstName,
        'If Accepted Offer',
        'Offers',
        'Seller',
      );
      const mailMessageForBuyerResponse = getMessageData(
        offer.user.firstName,
        'Response',
        'Offers',
        'Offer Creator',
      );
      const mailMessageForSellerResponse = getMessageData(
        offer.listing.user.firstName,
        'Response',
        'Offers',
        'Seller',
      );

      await this.mailService.sendOfferMail({
        email: offer.user.email,
        subject: mailMessageForBuyer[0]['Title'],
        text: mailMessageForBuyer[0]['Body'],
      });
      await this.mailService.sendOfferMail({
        email: offer.listing.user.email,
        subject: mailMessageForSeller[0]['Title'],
        text: mailMessageForSeller[0]['Body'],
      });

      await this.mailService.sendOfferMail({
        email: offer.user.email,
        subject: mailMessageForBuyerResponse[0]['Title'],
        text: mailMessageForBuyerResponse[0]['Body'],
      });
      await this.mailService.sendOfferMail({
        email: offer.listing.user.email,
        subject: mailMessageForSellerResponse[0]['Title'],
        text: mailMessageForSellerResponse[0]['Body'],
      });

      return update;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async rejectOffer(user: User, updateOfferInput: UpdateOfferInput) {
    try {
      const { id } = updateOfferInput;

      const offer = await this.offerRepository.findOne({
        where: { id: id },
        relations: ['listing.user'],
        select: {
          user: { email: true, firstName: true },
        },
      });

      if (!offer) {
        throw new NotFoundException('Offer not found');
      }

      if (user.id != offer.listing.user.id) {
        throw new BadRequestException('Only the Creator can reject an offer');
      }

      const update = await this.offerRepository.update(id, {
        status: 'rejected',
      });

      const mailMessageForBuyer = getMessageData(
        offer.user.firstName,
        'Accepted',
        'Offers',
        'Buyer',
      );
      const mailMessageForSeller = getMessageData(
        offer.listing.user.firstName,
        'If Accepted Offer',
        'Offers',
        'Seller',
      );
      const mailMessageForBuyerResponse = getMessageData(
        offer.user.firstName,
        'Response',
        'Offers',
        'Offer Creator',
      );
      const mailMessageForSellerResponse = getMessageData(
        offer.listing.user.firstName,
        'Response',
        'Offers',
        'Seller',
      );

      await this.mailService.sendOfferMail({
        email: offer.user.email,
        subject: mailMessageForBuyer[0]['Title'],
        text: mailMessageForBuyer[0]['Body'],
      });
      await this.mailService.sendOfferMail({
        email: offer.listing.user.email,
        subject: mailMessageForSeller[0]['Title'],
        text: mailMessageForSeller[0]['Body'],
      });
      await this.mailService.sendOfferMail({
        email: offer.user.email,
        subject: mailMessageForBuyer[0]['Title'],
        text: mailMessageForBuyer[0]['Body'],
      });
      await this.mailService.sendOfferMail({
        email: offer.listing.user.email,
        subject: mailMessageForSeller[0]['Title'],
        text: mailMessageForSeller[0]['Body'],
      });

      await this.mailService.sendOfferMail({
        email: offer.user.email,
        subject: mailMessageForBuyerResponse[0]['Title'],
        text: mailMessageForBuyerResponse[0]['Body'],
      });
      await this.mailService.sendOfferMail({
        email: offer.listing.user.email,
        subject: mailMessageForSellerResponse[0]['Title'],
        text: mailMessageForSellerResponse[0]['Body'],
      });
      return update;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
}
