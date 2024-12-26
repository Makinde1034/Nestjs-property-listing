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
import { NotificationScope, User } from '../../../entities';
import { PaymentService } from '../../payment/services/payment.service';
import { EntityManager, MoreThanOrEqual } from 'typeorm';
import { ListingService } from './listing.service';
import { AppStrings } from '../../../common/messages/app.strings';

import { addDaysToDate } from '../../../common/utils/helper';

import { PdfInput } from '../../file-handler/dto/pdf.dto';
import {
  NotificationScopeRepository,
  UserRepository,
} from '../../user/repositories';
import { NotificationScopeEnum } from '../../../common/enums/notification-scope.enum';

import { AuctionEnum, OfferListEnum } from '../../../common/enums/status.enum';
import { AdminService } from '../../admin/services/admin.service';
import { ListingRepository } from '../repositories/listing.repository';
import { SuccessResponse } from '../../../common/utils/success.response';
import { Offer } from '../../../entities/offer.entity';

import { AuctionParticipantRepository } from '../repositories/auction-participant.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent, Purpose } from '../../../common/enums';

@Injectable()
export class OfferService {
  constructor(
    private readonly offerRepository: OfferRepository,
    private readonly paymentService: PaymentService,
    private readonly listingService: ListingService,
    private readonly userRepository: UserRepository,
    private readonly notificationScopeRepository: NotificationScopeRepository,
    private readonly adminDefaultService: AdminService,
    private readonly listingRepository: ListingRepository,
    private readonly auctionParticipantRepository: AuctionParticipantRepository,
    private readonly eventEmiter: EventEmitter2,
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
      const listing = await this.listingService.findOneListingForBuyer(
        createOfferDto.listingId,
      );

      if (!listing) {
        throw new NotFoundException(AppStrings.LISTING_NOT_FOUND);
      }

      const offerExpiry = new Date(createOfferDto.expireAt);

      const maxExpiry = new Date(
        addDaysToDate(new Date(), adminDefault.maximumDaysForOfferExpiration),
      );

      if (maxExpiry <= offerExpiry) {
        throw new BadRequestException(`Max expiry is ${maxExpiry}`);
      }

      const [minimumPrice, saii, vat] =
        await this.getMinimumOfferForAListingAndUser(
          createOfferDto.price,
          listing.price,
          listing.purpose,
        );

      if (!listing.negotiable) {
        throw new BadRequestException(AppStrings.LISTING_IS_NOT_NEGOTIABLE);
      }
      if (offerExpiry <= new Date()) {
        throw new BadRequestException('Expiry Date is in the past');
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
      createOfferDto.saiiFee = saii;
      createOfferDto.vat = vat;

      const offerPayload = await this.offerRepository.save(createOfferDto);

      const seller = await this.userRepository.findOneOrFail({
        where: { id: listing.userId },
      });

      const data: PdfInput = {
        createdDate: `${offerPayload.createdAt.getDate()}-${offerPayload.createdAt.getMonth() + 1}-${offerPayload.createdAt.getFullYear()}`,
        sellerCRNumber: seller.crNumber,
        sellerzatcaNumber: seller.zatcaNuber,
        sellerAddress: seller.address,
        sellerName:
          seller.language === 'en'
            ? `${seller.firstName} ${seller.lastName}`
            : `${seller.arabicFirstName} ${seller.arabicLastName}`,
        customerCRNumber: user.crNumber,
        customerName:
          user.language === 'en'
            ? `${user.firstName} ${user.lastName}`
            : `${user.arabicFirstName} ${user.arabicLastName}`,
        customerAddress: user.address,
        customerZatcaNumber: user.zatcaNuber,
        totalWithVat: [offerPayload.price],
        itemVat: [{ vat: adminDefault.vat, vatValue: vat }],
        product: offerPayload,
        sumTotalWithoutVat: offerPayload.price - vat,
        sumTotalVat: vat,
        sumTotalWithVat: offerPayload.price,
      };

      //TODO: switch to event emitter
      this.paymentService.invoice(data, user, listing);

      // Find the Scope available for application
      const notificationPreference =
        await this.notificationScopeRepository.find();
      //Filter out the correct scope
      const scope: NotificationScope = notificationPreference.find(
        (element) => {
          if (element.name == NotificationScopeEnum.OFFERS) {
            return element;
          }
        },
      );

      //TODO:switch to an emited event
      this.eventEmiter.emit(NotificationEvent.SEND_NOTIFICATION, {
        creatorId: user.id,
        receiverId: seller.id,
        scope: scope,
        event: 'Create',
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
    offerPrice: number,
    listingPrice: number,
    purchaseType: string,
  ): Promise<[number, number, number]> {
    try {
      let vat: number, saii: number;
      const adminDefault = await this.adminDefaultService.adminDefault();
      const minimumPrice =
        (adminDefault.minimumOfferPercentage / 100) * listingPrice;

      if (purchaseType == Purpose.RENT) {
        saii = (adminDefault.saiiForRent / 100) * offerPrice;
        vat =
          (adminDefault.vat / 100) *
          (adminDefault.saiiForRent / 100) *
          offerPrice;
      }
      if (purchaseType == Purpose.SALE) {
        saii = (adminDefault.saiiForSale / 100) * offerPrice;
        vat =
          (adminDefault.vat / 100) *
          (adminDefault.saiiForSale / 100) *
          offerPrice;
      }
      const minimumListingPrice = minimumPrice;
      return [minimumListingPrice, saii, vat];
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
      const listing = await this.listingRepository.findOne({
        where: { id: findOfferInput.listingId },
        relations: ['listingType'],
      });

      if (!listing) {
        throw new NotFoundException(AppStrings.LISTING_NOT_FOUND);
      }

      const [offer, total] = await this.offerRepository.findAndCount({
        where: {
          listingId: findOfferInput.listingId,
        },
        skip: findOfferInput.skip,
        take: findOfferInput.take,
        relations: ['user'],
      });

      return { offer, listing, total };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.log(error);
        throw new BadRequestException(error);
      }
    }
  }
  async findManyForOwner(findOfferInput: FindOfferInput, user?: User) {
    try {
      const skip = findOfferInput.skip ?? 0;
      const take = findOfferInput.take ?? 20;
      const [[offer, total], totalOfferOnlisting] = await Promise.all([
        this.offerRepository
          .createQueryBuilder('offer')
          .leftJoinAndSelect('offer.listing', 'listing')
          .leftJoinAndSelect('offer.user', 'user')
          .leftJoinAndSelect('listing.listingType', 'listingType')
          .leftJoinAndSelect('listing.listingAttributes', 'listingAttributes')
          .leftJoinAndSelect('listingAttributes.attribute', 'attribute')
          .where('offer.userId = :userId', {
            userId: user.id,
          })
          .andWhere(
            findOfferInput.listingId ? 'listing.id = :listingId' : '1=1',
            {
              listingId: findOfferInput.listingId ?? undefined,
            },
          )
          .skip(skip)
          .take(take)
          .getManyAndCount(),

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
      const { id, listingId, ...rest } = updateOfferInput;

      const [offer, scope, currentOffer] = await Promise.all([
        // Fetch offer and highest offer in a single query
        this.offerRepository
          .createQueryBuilder('offer')
          .leftJoinAndSelect('offer.listing', 'listing')
          .leftJoinAndSelect('listing.user', 'listingUser')

          .select([
            'offer.id',
            'offer.price',
            'listing.id',
            'listing.purpose',
            'listingUser.id',
            'listingUser.email',
            'listingUser.firstName',
            'listing.price',
            'offer.createdAt',
          ])
          .addSelect((subQuery) => {
            return subQuery
              .select('MAX(offerSub.price)', 'maxPrice')
              .from(Offer, 'offerSub')
              .where('offerSub.listingId = :listingId', { listingId });
          }, 'maxPrice')
          .where('offer.id = :id', { id })
          .getRawOne(),

        // Fetch notification preference
        this.notificationScopeRepository.findOne({
          where: { name: NotificationScopeEnum.OFFERS },
        }),
        await this.offerRepository.findOneBy({ id }),
      ]);

      const { maxPrice } = offer;
      const highestOfferPrice = maxPrice || 0;

      const [minimumPrice, saii, vat] =
        await this.getMinimumOfferForAListingAndUser(
          rest.price,
          offer.listing_price,
          offer.listing_purpose,
        );

      // Validate if offer exists
      if (!offer) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }
      if (offer.status == OfferListEnum.EXPIRED) {
        throw new BadRequestException('offer already expired');
      }

      const adminDefault = await this.adminDefaultService.adminDefault();

      const offerExpiry = new Date(updateOfferInput.expireAt);

      const maxExpiry = new Date(
        addDaysToDate(new Date(), adminDefault.maximumDaysForOfferExpiration),
      );

      if (offerExpiry >= maxExpiry) {
        throw new BadRequestException(`Max expiry is ${maxExpiry}`);
      }

      if (offerExpiry <= new Date()) {
        throw new BadRequestException('Expiry Date is in the past');
      }

      // Validate if price is greater than the highest existing offer
      if (highestOfferPrice >= rest.price) {
        throw new BadRequestException(
          `Minimum Offer must be greater than ${highestOfferPrice}`,
        );
      }
      if (currentOffer.status == OfferListEnum.EXPIRED) {
        throw new BadRequestException(`Offer expired`);
      }

      // Validate minimum price requirement
      if (minimumPrice > rest.price) {
        throw new BadRequestException(
          `Minimum Offer must be greater than ${minimumPrice}`,
        );
      }

      // Validate that the user isn't editing an offer on their own listing
      if (user.id === offer.listingUser_id) {
        throw new BadRequestException(
          'The creator of a listing cannot edit an offer on that listing',
        );
      }

      // Send notification using an event emitter

      // Update offer with new data and saiiFee
      const { affected } = await this.offerRepository.update(id, {
        saiiFee: saii,
        ...rest,
      });
      if (updateOfferInput.price) {
        updateOfferInput.userId = user.id;
        updateOfferInput.saiiFee = saii;
        updateOfferInput.vat = vat;
        updateOfferInput.expireAt = new Date(addDaysToDate(new Date(), 1));

        const seller = await this.userRepository.findOneOrFail({
          where: { id: offer.listingUser_id },
        });

        const data: PdfInput = {
          createdDate: `${offer.offer_createdAt.getDate()}-${offer.offer_createdAt.getMonth() + 1}-${offer.offer_createdAt.getFullYear()}`,
          sellerCRNumber: seller.crNumber,
          sellerzatcaNumber: seller.zatcaNuber,
          sellerAddress: seller.address,
          sellerName:
            seller.language === 'en'
              ? `${seller.firstName} ${seller.lastName}`
              : `${seller.arabicFirstName} ${seller.arabicLastName}`,
          customerCRNumber: user.crNumber,
          customerName:
            user.language === 'en'
              ? `${user.firstName} ${user.lastName}`
              : `${user.arabicFirstName} ${user.arabicLastName}`,
          customerAddress: user.address,
          customerZatcaNumber: user.zatcaNuber,
          totalWithVat: [offer.price],
          itemVat: [{ vat: adminDefault.vat, vatValue: vat }],
          product: offer,
          sumTotalWithoutVat: offer.price - vat,
          sumTotalVat: vat,
          sumTotalWithVat: offer.price,
        };

        this.eventEmiter.emit(NotificationEvent.SEND_NOTIFICATION, {
          creatorId: user.id,
          receiverId: seller.id,
          scope: scope,
          event: 'Update',
          recipientFormat: ['Seller', 'Offer Creator'],
        });

        //TODO: switch to event emitter
        this.paymentService.invoice(data, user, offer.listing);
      }

      // Return the updated offer only if it was affected
      if (affected) {
        return await this.offerRepository.findOneBy({ id });
      }
      throw new BadRequestException('Offer update failed');
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException('Offer update failed', error);
      }
    }
  }

  async acceptOffer(user: User, updateOfferInput: UpdateOfferInput) {
    const { id } = updateOfferInput;
    const offerPayload = await this.offerRepository.findOne({
      where: { id },
    });

    const auctionparticipant = await this.auctionParticipantRepository.find({
      where: {
        listingId: offerPayload.listingId,
        auction: { status: AuctionEnum.ACTIVE },
      },
    });

    if (auctionparticipant.length > 0) {
      throw new BadRequestException(
        AppStrings.CANNOT_ACCEPT_AN_OFFER_WHILE_LISTING_IS_BEING_AUCTIONED,
      );
    }

    return await this.offerRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        try {
          // Fetch offer and listing user in a single query, limiting selected fields
          const offer = await entityManager.findOne(Offer, {
            where: { id },
            relations: ['listing', 'listing.user'],
            select: {
              id: true,
              listing: { id: true, user: { id: true } },
            },
          });

          // Validate if offer exists
          if (!offer) {
            throw new NotFoundException('Offer not found');
          }

          // Validate if user is the creator of the listing
          if (user.id !== offer.listing.user.id) {
            throw new BadRequestException(
              'Only the creator can accept an offer',
            );
          }

          // Update offer status and return updated offer immediately using RETURNING (if supported by your DB)
          const updateResult = await entityManager
            .createQueryBuilder()
            .update(Offer)
            .set({ status: 'accepted' })
            .where({ id })
            .returning(['id', 'status']) // Fetch updated fields right after the update
            .execute();

          if (!updateResult.affected) {
            throw new BadRequestException('Failed to update offer status');
          }

          // Fetch notification preference only if offer update is successful
          const notificationPreference = await entityManager.findOne(
            NotificationScope,
            {
              where: { name: NotificationScopeEnum.OFFERS },
            },
          );

          // Send notification (event emitter can be used here)
          // this.eventEmiter.emit(NotificationEvent.SEND_NOTIFICATION, {
          //   creatorId: user.id,
          //   receiverId: offer.listing.user.id,
          //   scope: notificationPreference,
          //   event: NotificationScopesEnum.OFFER_RESPONSE,
          //   recipientFormat: ['Seller', 'Offer Creator'],
          //   type: null,
          // });

          this.eventEmiter.emit(NotificationEvent.SEND_NOTIFICATION, {
            creatorId: user.id,
            receiverId: offer.listing.user.id,
            scope: notificationPreference,
            event: 'Update',
            recipientFormat: ['Seller', 'Offer Creator'],
          });

          // Return the updated offer
          return updateResult.raw[0]; // Returning the updated offer from the query result
        } catch (error) {
          if (error instanceof HttpException) {
            throw error;
          } else {
            this.logger.error('Error accepting offer:', error);
            throw new BadRequestException('Failed to accept offer');
          }
        }
      },
    );
  }

  async rejectOffer(user: User, updateOfferInput: UpdateOfferInput) {
    const { id } = updateOfferInput;

    return await this.offerRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        try {
          // Fetch offer and listing user in a single query, limiting selected fields
          const offer = await entityManager.findOne(Offer, {
            where: { id },
            relations: ['listing', 'listing.user'],
            select: {
              id: true,
              listing: { id: true, user: { id: true } },
            },
          });

          // Validate if offer exists
          if (!offer) {
            throw new NotFoundException('Offer not found');
          }

          // Validate if user is the creator of the listing
          if (user.id !== offer.listing.user.id) {
            throw new BadRequestException(
              'Only the creator can accept an offer',
            );
          }

          // Update offer status and return updated offer immediately using RETURNING (if supported by your DB)
          const updateResult = await entityManager
            .createQueryBuilder()
            .update(Offer)
            .set({ status: 'rejected' })
            .where({ id })
            .returning(['id', 'status']) // Fetch updated fields right after the update
            .execute();

          if (!updateResult.affected) {
            throw new BadRequestException('Failed to update offer status');
          }

          // Fetch notification preference only if offer update is successful
          const notificationPreference = await entityManager.findOne(
            NotificationScope,
            {
              where: { name: NotificationScopeEnum.OFFERS },
            },
          );

          // Send notification (event emitter can be used here)
          // this.eventEmiter.emit(NotificationEvent.SEND_NOTIFICATION, {
          //   creatorId: user.id,
          //   receiverId: offer.listing.user.id,
          //   scope: notificationPreference,
          //   event: NotificationScopesEnum.OFFER_RESPONSE,
          //   recipientFormat: ['Seller', 'Offer Creator'],
          //   type: null,
          // });

          this.eventEmiter.emit(NotificationEvent.SEND_NOTIFICATION, {
            creatorId: user.id,
            receiverId: offer.listing.user.id,
            scope: notificationPreference,
            event: 'Update',
            recipientFormat: ['Seller', 'Offer Creator'],
          });

          // Return the updated offer
          return updateResult.raw[0]; // Returning the updated offer from the query result
        } catch (error) {
          if (error instanceof HttpException) {
            throw error;
          } else {
            this.logger.error('Error accepting offer:', error);
            throw new BadRequestException('Failed to reject offer');
          }
        }
      },
    );
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
