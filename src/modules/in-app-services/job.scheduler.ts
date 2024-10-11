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

import {
  NotificationScopeRepository,
  UserRepository,
} from '../user/repositories';
import { formatDate } from 'date-fns';
import { LessThan } from 'typeorm';
import { OfferListEnum } from '../../common/enums/status.enum';
import { Injectable, Logger } from '@nestjs/common';
import { AuctionRepository } from '../listing/repositories/auction.repository';
import { addDaysToDate } from '../../common/utils/helper';
import { getMessageData } from '../../common/messages/alert-messages';
import { NotificationScopesEnum } from '../../common/enums/notification-scope.enum';
import { NotificationScope } from '../../entities';
import { AuctionParticipantRepository } from '../listing/repositories/auction-participant.repository';

@Injectable()
export class JobService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly listingRepository: ListingRepository,
    private readonly searchHistoryRepository: SearchHistoryRepository,
    private readonly mailService: MailgunEmailService,
    private readonly notificationService: NotificationService,
    private readonly offerRepository: OfferRepository,
    private readonly notificationScopeRepository: NotificationScopeRepository,
    private readonly auctionParticipantRepository: AuctionParticipantRepository,

    private readonly auctionRepository: AuctionRepository,
  ) {}
  logger = new Logger(JobService.name);

  @Cron(CronExpression.EVERY_DAY_AT_6AM, { timeZone: 'Africa/Cairo' })
  async handleCron() {
    await this.sendAlertOnIncompleteOffers();
    await this.sendNotificationForNewListingBasedOnSearchHistory();
    await this.updateListingFeatureStatus();
    await this.updateListingPromotionStatus();
  }

  @Cron(CronExpression.EVERY_12_HOURS, { timeZone: 'Africa/Cairo' })
  async handleDailyCron() {
    await this.updateOfferStatus();
    await this.updateListingFeatureStatus();
    await this.updateListingPromotionStatus();
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
      this.notificationService.sendUsersNotification({
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
          this.notificationService.sendUsersNotification({
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
        {
          status: OfferListEnum.EXPIRED,
          isPaid: false,
        },
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

  async NotifyUsersAboutUpcomingAuctions() {
    let oneMonthNotification = [];
    let oneWeekNotification = [];
    let threeDaysNotification = [];
    let oneDayNotification = [];

    const [users, auctions] = await Promise.all([
      this.userRepository.find(),
      this.auctionRepository.find(),
    ]);

    const notificationPreference =
      await this.notificationScopeRepository.find();
    //Filter out the correct scope
    const scope: NotificationScope = notificationPreference.find((element) => {
      if (element.name == NotificationScopesEnum.UPCOMING_EVENTS) {
        return element;
      }
    });

    auctions.forEach((element) => {
      if (element.startDate == new Date(addDaysToDate(new Date(), 1))) {
        oneDayNotification.push(element);
      }
      if (element.startDate == new Date(addDaysToDate(new Date(), 3))) {
        threeDaysNotification.push(element);
      }
      if (element.startDate == new Date(addDaysToDate(new Date(), 7))) {
        oneWeekNotification.push(element);
      }
      if (element.startDate == new Date(addDaysToDate(new Date(), 30))) {
        oneMonthNotification.push(element);
      }
    });

    const userArray = users.map((element) => {
      if (oneMonthNotification.length > 0) {
        this.notificationService.sendNotification({
          creatorId: element.id,
          scope: scope,
          event: NotificationScopesEnum.UPCOMING_EVENTS,
          recipientFormat: ['All platform', null],
        });
      }
      if (oneWeekNotification.length > 0) {
        this.notificationService.sendNotification({
          creatorId: element.id,
          scope: scope,
          event: NotificationScopesEnum.UPCOMING_EVENTS,
          recipientFormat: ['All platform', null],
        });
      }
      if (threeDaysNotification.length > 0) {
        this.notificationService.sendNotification({
          creatorId: element.id,
          scope: scope,
          event: NotificationScopesEnum.UPCOMING_EVENTS,
          recipientFormat: ['All platform', null],
        });
      }
      if (oneDayNotification.length) {
        this.notificationService.sendNotification({
          creatorId: element.id,
          scope: scope,
          event: NotificationScopesEnum.UPCOMING_EVENTS,
          recipientFormat: ['All platform', null],
        });
      }

      return element.email;
    });
  }

  async NotifyUsersAboutStartOfAuctionsTheySubscribedTo() {
    let oneDayNotification = [];

    const auctions = await this.auctionParticipantRepository.find({
      relations: ['user'],
    });

    const notificationPreference =
      await this.notificationScopeRepository.find();
    //Filter out the correct scope
    const scope: NotificationScope = notificationPreference.find((element) => {
      if (element.name == NotificationScopesEnum.UPCOMING_EVENTS) {
        return element;
      }
    });

    auctions.forEach((element) => {
      if (element.startDate == new Date(addDaysToDate(new Date(), 1))) {
        oneDayNotification.push(element);
      }
    });

    const userArray = users.map((element) => {
      if (oneDayNotification.length) {
        this.notificationService.sendNotification({
          creatorId: element.id,
          scope: scope,
          event: NotificationScopesEnum.UPCOMING_EVENTS,
          recipientFormat: ['All platform', null],
        });
      }

      return element.email;
    });
  }
}
