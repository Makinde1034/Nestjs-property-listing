/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
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
import { NotificationScopesEnum } from '../../../common/enums/notification-scope.enum';
import { NotificationService } from '../../notification/services';
import { OfferListEnum } from '../../../common/enums/status.enum';
import { AdminService } from '../../admin/services/admin.service';
import { ListingRepository } from '../repositories/listing.repository';
import { SuccessResponse } from '../../../common/utils/success.response';
import { SaiiFees } from '../../admin/dto/response/admin-response';

@Injectable()
export class OfferService {
  constructor(
    private readonly offerRepository: OfferRepository,
    private paymentService: PaymentService,
    private listingService: ListingService,
    private mailService: MailgunEmailService,
    private userRepository: UserRepository,
    private notificationScopeRepository: NotificationScopeRepository,
    private notificationService: NotificationService,
    private adminDefaultService: AdminService,
    private listingRepository: ListingRepository,
  ) {}
  logger = new Logger(OfferService.name);

  async getLastOfferPrice(id: string) {
    const offer = await this.offerRepository.find({
      where: {
        listingId: id,
      },
      select: ['id', 'price'],
      order: { price: 'DESC' },
      take: 1,
      skip: 0,
    });
    return offer[0];
  }

  async createAnOffer(createOfferDto: CreateOfferDto, user: User) {
    try {
      const offer = await this.offerRepository.find({
        where: {
          price: MoreThanOrEqual(createOfferDto.price),
          listingId: createOfferDto.listingId,
        },
        order: { price: 'DESC' },
      });
      const adminDefault = await this.adminDefaultService.adminDefault();

      const offerExpiry = new Date(createOfferDto.expireAt);

      const maxExpiry = new Date(
        addDaysToDate(new Date(), adminDefault.maximumDaysForOfferExpiration),
      );

      if (offerExpiry > maxExpiry) {
        throw new BadRequestException(`Max expiry is ${maxExpiry}`);
      }

      const [minimumPrice, listing, saiiFee] =
        await this.getMinimumOfferForAListingAndUser(createOfferDto.listingId);

      if (!listing.negotiable) {
        throw new BadRequestException(AppStrings.LISTING_IS_NOT_NEGOTIABLE);
      }

      if (createOfferDto.price < minimumPrice) {
        throw new BadRequestException(
          `Minimum Offer must be greater than  ${minimumPrice}`,
        );
      }

      if (user.id == listing.user.id) {
        throw new BadRequestException(
          'The creator of a listing cannot create an offer on  that listing',
        );
      }
      if (offer.length > 0) {
        throw new BadRequestException(
          `Minimum Offer must be greater than ${offer[0].price}`,
        );
      }

      createOfferDto.userId = user.id;
      createOfferDto.saiiFee = saiiFee;
      createOfferDto.expireAt = new Date(addDaysToDate(new Date(), 1));

      const offerPayload = await this.offerRepository.save(createOfferDto);

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

      const seller = await this.userRepository.findOneOrFail({
        where: { id: listing.userId },
        relations: ['notificationPreference'],
      });

      // Find the Scope available for application
      const notificationPreference =
        await this.notificationScopeRepository.find();
      //Filter out the correct scope
      const scope: NotificationScope = notificationPreference.find(
        (element) => {
          if (element.name == NotificationScopesEnum.CREATE_OFFER) {
            return element;
          }
        },
      );

      //TODO:switch to an emited event
      this.notificationService.sendNotification({
        creatorId: user.id,
        receiverId: seller.id,
        scope,
      });

      return offerPayload;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.data || error?.message || error);
    }
  }

  async finalizeOffer(id: string) {
    try {
      const offer = await this.offerRepository.findOneBy({ id });
      if (!offer) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }

      const { affected } = await this.offerRepository.update(id, {
        status: OfferListEnum.ACTIVE,
      });
      if (affected > 0) {
        return await this.offerRepository.findOneByOrFail({ id: offer.id });
      }
    } catch (error) {
      this.logger.log(error);

      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error);
      }
    }
  }

  async getMinimumOfferForAListingAndUser(
    listingId: string,
  ): Promise<[number, Listing, number]> {
    try {
      const listing =
        await this.listingService.findOneListingForBuyer(listingId);

      if (!listing) {
        throw new NotFoundException(AppStrings.LISTING_NOT_FOUND);
      }

      const adminDefault = await this.adminDefaultService.adminDefault(); //TODO: Add to admin default
      const price =
        (adminDefault.minimumOfferPercentage / listing.price) *
        100 *
        listing.price;
      const saii = (adminDefault.saii / listing.price) * 100 * listing.price;
      const vat = (adminDefault.vat / saii) * 100;
      const total = vat + saii + price;

      const minimumListingPrice = listing.price - price + total;
      return [minimumListingPrice, listing, saii];
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async findOne(id: string) {
    try {
      return await this.offerRepository.findOneOrFail({
        where: { id: id },
        relations: ['listing'],
      });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException();
    }
  }

  async findMany(findOfferInput: FindOfferInput) {
    try {
      const listing = await this.listingRepository.findOneBy({
        id: findOfferInput.listingId,
      });
      const [offer, total] = await this.offerRepository.findAndCount({
        where: {
          listingId: findOfferInput.listingId,
          status: OfferListEnum.ACTIVE,
        },
        skip: findOfferInput.skip,
        take: findOfferInput.take,
      });

      return { offer, listing, total };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
  async findManyForOwner(findOfferInput: FindOfferInput, user?: User) {
    try {
      const [[offer, total], totalOfferOnlisting] = await Promise.all([
        this.offerRepository.findAndCount({
          where: {
            listingId: findOfferInput.listingId,
            userId: user.id,
          },
          skip: findOfferInput.skip,
          take: findOfferInput.take,
          relations: ['listing'],
        }),

        this.listingRepository.count({ where: { userId: user.id } }),
      ]);

      return { offer, total, totalOfferOnlisting };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
  async updateOffer(user: User, updateOfferInput: UpdateOfferInput) {
    try {
      const { id, ...rest } = updateOfferInput;

      const [offer, allOffers] = await Promise.all([
        await this.offerRepository.findOne({
          where: { id: updateOfferInput.id },
          relations: ['user', 'listing', 'listing.user'],
          select: {
            listing: {
              id: true,
              user: { email: true, firstName: true },
            },
          },
        }),
        await this.offerRepository.find({
          where: {
            price: MoreThanOrEqual(updateOfferInput.price),
            listingId: updateOfferInput.listingId,
          },
          skip: 0,
          take: 1,
          order: { price: 'DESC' },
        }),
      ]);

      if (!offer) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }

      if (allOffers.length > 0) {
        throw new BadRequestException(
          `Minimum Offer must be greater than ${allOffers[0].price}`,
        );
      }

      const [minimumPrice, listing, saiiFee] =
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

      const notificationPreference =
        await this.notificationScopeRepository.find();
      //Filter out the correct scope
      const scope: NotificationScope = notificationPreference.find(
        (element) => {
          if (element.name == NotificationScopesEnum.UPDATE_OFFER) {
            return element;
          }
        },
      );

      //TODO:switch to an emited event
      this.notificationService.sendNotification({
        creatorId: user.id,
        receiverId: listing.userId,
        scope,
      });

      const { affected } = await this.offerRepository.update(id, {
        saiiFee: saiiFee,
        ...rest,
      });

      if (affected) {
        return await this.offerRepository.findOneBy({ id });
      }
    } catch (error) {
      console.log(error);
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
        subject: mailMessageForBuyer[0]['title'],
        text: mailMessageForBuyer[0]['body'],
      });
      await this.mailService.sendOfferMail({
        email: offer.listing.user.email,
        subject: mailMessageForSeller[0]['title'],
        text: mailMessageForSeller[0]['body'],
      });
      await this.mailService.sendOfferMail({
        email: offer.user.email,
        subject: mailMessageForBuyerResponse[0]['title'],
        text: mailMessageForBuyerResponse[0]['body'],
      });
      await this.mailService.sendOfferMail({
        email: offer.listing.user.email,
        subject: mailMessageForSellerResponse[0]['title'],
        text: mailMessageForSellerResponse[0]['body'],
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
        subject: mailMessageForBuyer[0]['title'],
        text: mailMessageForBuyer[0]['body'],
      });
      await this.mailService.sendOfferMail({
        email: offer.listing.user.email,
        subject: mailMessageForSeller[0]['title'],
        text: mailMessageForSeller[0]['body'],
      });
      await this.mailService.sendOfferMail({
        email: offer.user.email,
        subject: mailMessageForBuyer[0]['title'],
        text: mailMessageForBuyer[0]['body'],
      });
      await this.mailService.sendOfferMail({
        email: offer.listing.user.email,
        subject: mailMessageForSeller[0]['title'],
        text: mailMessageForSeller[0]['body'],
      });

      await this.mailService.sendOfferMail({
        email: offer.user.email,
        subject: mailMessageForBuyerResponse[0]['title'],
        text: mailMessageForBuyerResponse[0]['body'],
      });
      await this.mailService.sendOfferMail({
        email: offer.listing.user.email,
        subject: mailMessageForSellerResponse[0]['title'],
        text: mailMessageForSellerResponse[0]['body'],
      });
      return update;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async deleteOffer(id: string) {
    try {
      // TODO: revert payment

      const offer = await this.offerRepository.findOneBy({ id });

      if (!offer) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }

      const { affected } = await this.offerRepository.softDelete({ id });

      if (affected) {
        return new SuccessResponse(AppStrings.DELETED_SUCCESSFULLY);
      }
      throw new BadRequestException('Offer could not be deleted');
    } catch (error) {
      this.logger.error('Error in deleteOffer:', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }

      // For other errors, throw a generic exception
      throw new InternalServerErrorException(
        'An error occurred while deleting the offer',
      );
    }
  }
}
