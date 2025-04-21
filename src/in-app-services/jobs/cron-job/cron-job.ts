/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Cron, CronExpression } from '@nestjs/schedule';
import { SearchHistoryRepository } from '../../../modules/listing/repositories/search-history.repository';
import { ListingRepository } from '../../../modules/listing/repositories/listing.repository';

import { NotificationService } from '../../../modules/notification/services';
import { MailgunEmailService } from '../../../modules/mail/services/implementations';
import { OfferRepository } from '../../../modules/listing/repositories';

import {
  NotificationScopeRepository,
  UserRepository,
} from '../../../modules/user/repositories';
import { formatDate, subDays } from 'date-fns';
import { Between, In, LessThan, LessThanOrEqual, MoreThan } from 'typeorm';
import {
  OfferListEnum,
  PaymentStatus,
} from '../../../common/enums/status.enum';
import { Injectable, Logger } from '@nestjs/common';
import { AuctionRepository } from '../../../modules/listing/repositories/auction.repository';
import {
  addDaysToDate,
  calculateDaysDifference,
  removeDaysFromDate,
} from '../../../common/utils/helper';
import { NotificationScopeEnum } from '../../../common/enums/notification-scope.enum';
import { Listing, NotificationScope } from '../../../entities';
import { AuctionParticipantRepository } from '../../../modules/listing/repositories/auction-participant.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent, UserProfileTypeEnum } from '../../../common/enums';
import { SearchHistory } from '../../../entities/search-history.entity';
import { InvoiceRepository } from '../../../modules/payment/repositories/invoice.repository';
import { PaymentEnum } from '../../../common/enums/payment.enum';
import { weekdays } from 'moment';

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
    private readonly eventEmitter: EventEmitter2,
    private readonly auctionRepository: AuctionRepository,
    private readonly invoiceRepository: InvoiceRepository,
  ) {}
  logger = new Logger(JobService.name);

  @Cron(CronExpression.EVERY_DAY_AT_6AM, { timeZone: 'Africa/Cairo' })
  async handleCron() {
    await this.sendAlertOnIncompleteOffers();
    await this.sendNotificationForNewListingBasedOnSearchHistory();
    await this.updateListingFeatureStatus();
    await this.updateListingPromotionStatus();
    await this.notifyUsersAboutUpcomingAuctions();
  }
  /***************************
   * Uncomment to test       *
   ***************************/
  // @Cron(CronExpression.EVERY_30_SECONDS)
  // async test() {
  // this.logger.log('now', new Date());
  //   // await this.sendAlertOnIncompleteOffers();
  //   // await this.sendNotificationForNewListingBasedOnSearchHistory();
  //   // await this.updateListingFeatureStatus();
  //   // await this.updateListingPromotionStatus();
  // await this.notifyUsersAboutUpcomingAuctions();
  // await this.notifyUsersAboutUpcomingAuctionsDailyCounter();
  // }

  @Cron(CronExpression.EVERY_12_HOURS, { timeZone: 'Africa/Cairo' })
  async handleDailyCron() {
    await this.updateOfferStatus();
    await this.updateListingFeatureStatus();
    await this.updateListingPromotionStatus();
    await this.deleteUnsuccessfulListing();
    await this.updatePaymentStatus();
    await this.notifyUsersAboutUpcomingAuctionsDailyCounter();
  }

  async sendNotificationForNewListingBasedOnSearchHistory() {
    try {
      const listingArrayMails: string[] = [];
      const listingArrayUserId: string[] = [];
      const searchHistory = await this.searchHistoryRepository.find({
        where: { isValid: false },
        relations: ['user'],
      });

      const userNotifications: { id: string; value: SearchHistory[] }[] = [];

      for (const element of searchHistory) {
        const listing = await this.listingRepository.findOne({
          where: {
            price: Between(element.minPrice, element.maxPrice),
            // RentingOption: element.rentingOption,
            // Purpose: element.type, // TODO: Add more conditions
          },
          relations: ['user'],
        });

        if (listing) {
          listingArrayMails.push(element.user.email);

          // Await this.searchHistoryRepository.update(element.id, {
          //   IsValid: true,
          // });

          listingArrayUserId.push(element.user.id);

          // Add to userNotifications
          const existingUserNotification = userNotifications.find(
            (value) => value.id === element.user.id,
          );

          if (existingUserNotification) {
            existingUserNotification.value.push(element);
          } else {
            userNotifications.push({ id: element.user.id, value: [element] });
          }
        }
      }
      const notificationPreference =
        await this.notificationScopeRepository.find();
      //Filter out the correct scope
      const scope: NotificationScope = notificationPreference.find(
        (element) => {
          if (
            element.scopeGroup ==
            NotificationScopeEnum.LISTINGS_IN_SAVED_SEARCHES
          ) {
            return element;
          }
        },
      );

      // Send notifications for each user
      for (const notification of userNotifications) {
        this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
          receiverId: notification.id,
          scope: scope,
          event: 'Created',
          recipientFormat: [null, 'User that has searched'],
          type: null,
        });
      }
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
          roles: { englishName: 'Request finalizer' },
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
  async updatePaymentStatus() {
    try {
      await this.invoiceRepository.update(
        {
          expireAt: MoreThan(new Date()),

          status: PaymentStatus.PENDING,
        },
        {
          status: PaymentStatus.FAILED,
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

  async notifyUsersAboutUpcomingAuctions() {
    try {
      const currentDate = new Date();

      const notificationPreference =
        await this.notificationScopeRepository.find();
      const scope = notificationPreference.find(
        (element) =>
          element.scopeGroup === NotificationScopeEnum.UPCOMING_AUCTIONS,
      );

      // Fetch auctions that start in exactly 7, 14, 21, or 28 days
      const daysAhead = [7, 14, 21, 28];
      const targetDates = daysAhead.map((days) =>
        addDaysToDate(currentDate, days),
      );

      const auctionsByWeek = await this.auctionRepository
        .createQueryBuilder('auction')
        .select(['auction.id', 'auction.startDate'])
        .where(`DATE("auction"."startDate") IN (:...targetDates)`, {
          targetDates,
        })
        .getMany();

      // Handle empty results
      if (!auctionsByWeek || auctionsByWeek.length === 0) {
        this.logger.log('No auctions found for 7-day intervals.');
        return;
      }

      this.logger.log('Auctions grouped by week:', auctionsByWeek);

      // Categorize auctions
      const oneMonthAuctions = [];
      const weeklyAuctionsMap: Record<number, any[]> = {};

      for (const auction of auctionsByWeek) {
        const weeksAway = Math.round(
          (new Date(auction.startDate).getTime() - currentDate.getTime()) /
            (1000 * 60 * 60 * 24 * 7),
        );

        if (weeksAway === 4) {
          oneMonthAuctions.push(auction);
        } else if (weeksAway >= 1 && weeksAway <= 3) {
          if (!weeklyAuctionsMap[weeksAway]) {
            weeklyAuctionsMap[weeksAway] = [];
          }
          weeklyAuctionsMap[weeksAway].push(auction);
        }
      }

      // Find the smallest week with auctions
      const smallestWeek = Math.min(
        ...Object.keys(weeklyAuctionsMap).map(Number),
        Infinity,
      );
      const smallestWeekAuctions = weeklyAuctionsMap[smallestWeek] || [];

      const batchSize = 100;
      let offset = 0;
      let usersBatch = [];

      do {
        usersBatch = await this.userRepository.find({
          where: {
            userType: In([
              UserProfileTypeEnum.INDIVIDUAL,
              UserProfileTypeEnum.COMPANY,
            ]),
          },
          select: ['id', 'userType'],
          skip: offset,
          take: batchSize,
        });

        usersBatch.forEach((user) => {
          const userNotifications = [];

          if (oneMonthAuctions.length > 0) {
            userNotifications.push({
              receiverId: user.id,
              scope,
              event: 'A month before',
              recipientFormat: [null, 'All platform'],
              type: null,
              img: oneMonthAuctions[0]?.imageLink || null,
            });
          }
          // sends notification for the auction of the smallest week startdate

          if (smallestWeekAuctions.length > 0) {
            userNotifications.push({
              receiverId: user.id,
              scope,
              event: 'Weekly',
              recipientFormat: [null, 'All platform'],
              type: null,
              count: smallestWeek,
              img: smallestWeekAuctions[0]?.imageLink || null,
            });
          }

          userNotifications.forEach((notification) =>
            this.eventEmitter.emit(
              NotificationEvent.SEND_NOTIFICATION,
              notification,
            ),
          );
        });

        offset += batchSize;
      } while (usersBatch.length > 0);
    } catch (error) {
      this.logger.error(
        'Failed to notify users about upcoming auctions',
        error,
      );
    }
  }

  async notifyUsersAboutUpcomingAuctionsDailyCounter() {
    try {
      const notificationPreference =
        await this.notificationScopeRepository.find();
      const scope = notificationPreference.find(
        (element) =>
          element.scopeGroup === NotificationScopeEnum.UPCOMING_AUCTIONS,
      );

      const currentDate = new Date();
      const targetDate = addDaysToDate(currentDate, 7);

      // Start of the 7th day (00:00:00)
      const auctionStartDateWeekStart = new Date(targetDate);
      auctionStartDateWeekStart.setHours(0, 0, 0, 0);

      // End of the 7th day (23:59:59)
      const auctionEndDateWeekEnd = new Date(targetDate);
      auctionEndDateWeekEnd.setHours(23, 59, 59, 999);

      const auctionEndDateWeekStart = subDays(targetDate, 7);

      const auctionsIn7Days = await this.auctionRepository
        .createQueryBuilder('auction')
        .select(['auction.id', 'auction.startDate', 'auction.imageLink'])
        .leftJoinAndSelect('auction.auctionParticipant', 'auctionParticipant')
        .leftJoinAndSelect('auctionParticipant.listing', 'listing')
        .leftJoinAndSelect('listing.user', 'user')
        .where(
          `auction.startDate < :targetDates  AND auction.startDate > :auctionEndDateWeekStart`,
          {
            targetDates: targetDate,

            auctionEndDateWeekStart,
          },
        )
        .getMany();

      if (!auctionsIn7Days || auctionsIn7Days.length === 0) {
        this.logger.log('No auctions found for 7-day interval.');
        return;
      }

      this.logger.log('Auctions starting in 7 days:', auctionsIn7Days);

      // Notify all platform users
      const batchSize = 100;
      let offset = 0;
      let usersBatch = [];

      do {
        usersBatch = await this.userRepository.find({
          where: {
            userType: In([
              UserProfileTypeEnum.INDIVIDUAL,
              UserProfileTypeEnum.COMPANY,
            ]),
          },
          select: ['id', 'userType'],
          skip: offset,
          take: batchSize,
        });

        usersBatch.forEach((user) => {
          auctionsIn7Days.forEach((auction) => {
            const daysTo = calculateDaysDifference(
              currentDate,
              new Date(auction.startDate),
            );

            this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
              receiverId: user.id,
              scope,
              event: 'Daily',
              recipientFormat: [null, 'Users enlisted to bid and sellers'],
              type: null,
              count: daysTo,
              img: auction.imageLink || null,
            });
          });
        });

        offset += batchSize;
      } while (usersBatch.length > 0);

      // Notify participants only for the auction they’re involved in
      auctionsIn7Days.forEach((auction) => {
        const daysTo = calculateDaysDifference(
          currentDate,
          new Date(auction.startDate),
        );

        auction.auctionParticipant.forEach((participant) => {
          const userId = participant.listing?.user?.id;
          if (userId) {
            this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
              creatorId: userId,
              scope,
              event: 'Daily',
              recipientFormat: ['Users enlisted to bid and sellers', null],
              type: null,
              count: daysTo,
              img: auction.imageLink || null,
            });
          }
        });
      });
    } catch (error) {
      this.logger.error(
        'Failed to notify users about upcoming auctions',
        error,
      );
    }
  }

  async deleteUnsuccessfulListing() {
    await this.listingRepository
      .createQueryBuilder('listing')
      .update(Listing)
      .set({ deletedAt: new Date() })
      .where('listing.publishable = :publishable', { publishable: false })
      .execute();
  }
}
