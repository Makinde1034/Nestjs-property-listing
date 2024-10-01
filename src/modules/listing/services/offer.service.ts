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

import { PdfInput } from '../../file-handler/dto/pdf.dto';
import {
  NotificationScopeRepository,
  UserRepository,
} from '../../user/repositories';
import { NotificationScopesEnum } from '../../../common/enums/notification-scope.enum';
import { NotificationService } from '../../notification/services';
import { OfferListEnum } from '../../../common/enums/status.enum';
import { AdminService } from '../../admin/services/admin.service';
import { ListingRepository } from '../repositories/listing.repository';
import { SuccessResponse } from '../../../common/utils/success.response';

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
        sellerCRNumber: '',
        sellerzatcaNumber: '',
        sellerAddress: '',
        sellerName: '',
        customerCRNumber: '',
        customerName: '',
        customerAddress: '',
        customerZatcaNumber: `${user.firstName} ${user.lastName}`,
        totalWithVat: [1],
        itemVat: [{ vat: 1, vatValue: 1 }],
        product: offerPayload,
        sumTotalWithoutVat: 1,
        sumTotalVat: 1,
        sumTotalWithVat: 1,
      };

      //TODO: switch to event emitter
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
        scope: scope,
        event: NotificationScopesEnum.CREATE_OFFER,
        recipientFormat: ['Seller', 'Offer Creator'],
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
        relations: ['user'],
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
      const { id, price, listingId, ...rest } = updateOfferInput;
      console.log(rest.expireAt);

      // Fetch offer and highest offer concurrently
      const [offer, highestOffer] = await Promise.all([
        this.offerRepository.findOne({
          where: { id },
          relations: ['user', 'listing.user'],
          select: {
            listing: {
              id: true,
              user: { email: true, firstName: true },
            },
          },
        }),
        this.offerRepository.findOne({
          where: {
            price: MoreThanOrEqual(price),
            listingId,
          },
          order: { price: 'DESC' },
        }),
      ]);

      // Validate if offer exists
      if (!offer) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }

      // Validate if price is greater than the highest existing offer
      if (highestOffer) {
        throw new BadRequestException(
          `Minimum Offer must be greater than ${highestOffer.price}`,
        );
      }

      // Fetch minimum price, listing and saiiFee for the offer
      const [minimumPrice, listing, saiiFee] =
        await this.getMinimumOfferForAListingAndUser(listingId);

      // Validate minimum price requirement
      if (minimumPrice > price) {
        throw new BadRequestException(
          `Minimum Offer must be greater than ${minimumPrice}`,
        );
      }

      // Validate that the user isn't editing an offer on their own listing
      if (user.id === listing.user.id) {
        throw new BadRequestException(
          'The creator of a listing cannot edit an offer on that listing',
        );
      }

      // Fetch notification preference
      const notificationPreference =
        await this.notificationScopeRepository.findOne({
          where: { name: NotificationScopesEnum.UPDATE_OFFER },
        });

      //TODO switch to event emmiter
      this.notificationService.sendNotification({
        creatorId: user.id,
        receiverId: listing.user.id, // Use listing.user.id directly
        scope: notificationPreference,
        event: NotificationScopesEnum.UPDATE_OFFER,
        recipientFormat: ['Seller', 'Offer Creator'],
      });

      // Update offer with new data and saiiFee
      const { affected } = await this.offerRepository.update(id, {
        saiiFee,
        ...rest,
      });

      if (affected) {
        return this.offerRepository.findOneBy({ id });
      }
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException('Offer update failed');
      }
    }
  }

  async acceptOffer(user: User, updateOfferInput: UpdateOfferInput) {
    try {
      const { id } = updateOfferInput;

      const offer = await this.offerRepository.findOne({
        where: { id: id },
        relations: ['user', 'listing', 'listing.user'],
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

      // Fetch notification preference
      const notificationPreference =
        await this.notificationScopeRepository.findOne({
          where: { name: NotificationScopesEnum.ACCEPTED },
        });

      //TODO switch to event emmiter
      this.notificationService.sendNotification({
        creatorId: user.id,
        receiverId: offer.listing.user.id,
        scope: notificationPreference,
        event: NotificationScopesEnum.ACCEPTED,
        recipientFormat: ['Seller', 'Offer Creator'],
      });

      return await this.offerRepository.findOneBy({ id });
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

      // Fetch notification preference
      const notificationPreference =
        await this.notificationScopeRepository.findOne({
          where: { name: NotificationScopesEnum.RESPONSE },
        });

      //TODO switch to event emmiter
      this.notificationService.sendNotification({
        creatorId: user.id,
        receiverId: offer.listing.user.id,
        scope: notificationPreference,
        event: NotificationScopesEnum.RESPONSE,
        recipientFormat: ['Seller', 'Offer Creator'],
      });

      return await this.offerRepository.findOneBy({ id });
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
