/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Cron, CronExpression } from '@nestjs/schedule';
import { SearchHistoryRepository } from '../listing/repositories/search-history.repository';
import { ListingRepository } from '../listing/repositories/listing.repository';

import { NotificationService } from '../notification/services';
import { MailgunEmailService } from '../mail/services/implementations';
import { OfferRepository } from '../listing/repositories';

import { UserRepository } from '../user/repositories';
import { formatDate } from 'date-fns';
import { LessThan } from 'typeorm';
import { OfferListEnum } from '../../common/enums/status.enum';
import { Injectable, Logger } from '@nestjs/common';
import { TicketRepository } from '../tickets/repositories';

@Injectable()
export class JobService {
  constructor(
    private userRepository: UserRepository,
    private listingRepository: ListingRepository,
    private searchHistoryRepository: SearchHistoryRepository,
    private mailService: MailgunEmailService,
    private pushNotification: NotificationService,
    private offerRepository: OfferRepository,
    private ticketRepository: TicketRepository,
  ) {}
  logger = new Logger(JobService.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Africa/Cairo' })
  async handleCron() {
    await this.sendAlertOnIncompleteOffers();
    await this.sendNotificationForNewListingBasedOnSearchHistory();
    await this.updateListingFeatureStatus();
    await this.updateListingPromotionStatus();
    await this.updateOfferStatus();
  }

  async sendNotificationForNewListingBasedOnSearchHistory() {
    try {
      const listingArrayMails: string[] = [];
      const listingArrayUserId: string[] = [];
      const searchHistory = await this.searchHistoryRepository.find({
        where: { isValid: false },
        relations: ['user'],
      });

      searchHistory.map(async (element) => {
        const listing = await this.listingRepository.findOne({
          where: {
            price: element.minPrice,

            rentingOption: element.rentingOption,

            purpose: element.type, //TODO: add more conditions
          },
          relations: ['user'],
        });
        if (listing) {
          listingArrayMails.push(element.user.email);
          this.searchHistoryRepository.update(element.id, {
            isValid: true,
          });
          listingArrayUserId.push(element.user.id);
        }
      });

      await this.mailService.sendSearchHistoryIsNowAvailable(listingArrayMails);
      this.pushNotification.sendUsersNotification({
        title: 'New listing',
        message: 'A listing that matches  your search is now available',
        isEmail: false,
        isPushNotification: true,
        recipients: listingArrayUserId,
        deepLink: '',
      });
    } catch (error) {
      this.logger.error(
        'Send Notification For New Listing Based On Search History',
        error,
      );
    }
  }

  async sendAlertOnIncompleteOffers() {
    try {
      const currentDate = new Date();
      const targetDate = new Date();
      targetDate.setDate(currentDate.getDate() + 1);

      const user = await this.userRepository.findOne({
        where: {
          userType: 'admin',
        },
      });

      const records = await this.offerRepository
        .createQueryBuilder('offer')
        .leftJoinAndSelect('offer.user', 'user')
        .leftJoinAndSelect('offer.listing', 'listing')
        .where('offer.createdAt = :targetDate', {
          targetDate: targetDate.toISOString(),
        })
        .getMany();

      for (const element of records) {
        if (element.listing.price >= element.price) {
          this.pushNotification.sendUsersNotification({
            title: 'New listing',
            message: `This offers created on ${formatDate(element.createdAt, 'MM/dd/yyyy')}, with listing Id: ${element.listingId},
           Seller's name: ${element.user.firstName} ${element.user.lastName},
           Buyer's name: ${element.user.firstName} ${
             element.user.lastName
           }, price ${element.price}
            Has been left resolved for a while`,
            isEmail: false,
            isPushNotification: true,
            recipients: [user.email],
            deepLink: '',
          });
        }
      }

      return records;
    } catch (error) {
      this.logger.error('send Alert On Incomplete Offers', error);
    }
  }

  async updateOfferStatus() {
    try {
      await this.offerRepository.update(
        {
          expireAt: LessThan(new Date()),

          status: OfferListEnum.ACTIVE,
        },
        { status: OfferListEnum.EXPIRED },
      );
    } catch (error) {
      this.logger.error('Update Offer Status', error);
    }
  }

  async updateListingPromotionStatus() {
    try {
      await this.listingRepository.update(
        {
          promotionExpiration: LessThan(new Date()),
          isListingPromoted: true,
        },
        { isListingPromoted: false },
      );
    } catch (error) {
      this.logger.error('Update Listing Promotion Status', error);
    }
  }

  async updateListingFeatureStatus() {
    try {
      await this.listingRepository.update(
        {
          featureExpiration: LessThan(new Date()),
          isListingFeatured: true,
        },
        { isListingFeatured: false },
      );
    } catch (error) {
      this.logger.error('update Listing Feature Status', error);
    }
  }
}
