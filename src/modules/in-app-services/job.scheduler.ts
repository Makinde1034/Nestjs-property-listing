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
import { Between, LessThan, LessThanOrEqual } from 'typeorm';
import { OfferListEnum } from '../../common/enums/status.enum';
import { Injectable, Logger } from '@nestjs/common';
import { AuctionRepository } from '../listing/repositories/auction.repository';
import {
  addDaysToDate,
  calculateDaysDifference,
  removeDaysFromDate,
} from '../../common/utils/helper';
import {
  NotificationScopeEnum,
  NotificationScopesEnum,
} from '../../common/enums/notification-scope.enum';
import { NotificationScope } from '../../entities';
import { AuctionParticipantRepository } from '../listing/repositories/auction-participant.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from '../../common/enums';
import { SearchHistory } from '../../entities/search-history.entity';

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
    private readonly eventEmiter: EventEmitter2,
    private readonly auctionRepository: AuctionRepository,
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

  @Cron(CronExpression.EVERY_30_SECONDS)
  async test() {
    console.log('now', new Date());
    // await this.sendAlertOnIncompleteOffers();
    await this.sendNotificationForNewListingBasedOnSearchHistory();
    // await this.updateListingFeatureStatus();
    // await this.updateListingPromotionStatus();
    // await this.notifyUsersAboutUpcomingAuctions();
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
      console.log(searchHistory);

      const userNotifications: Array<{ id: string; value: SearchHistory[] }> =
        [];

      for (const element of searchHistory) {
        const listing = await this.listingRepository.findOne({
          where: {
            price: element.minPrice,
            rentingOption: element.rentingOption,
            purpose: element.type, // TODO: Add more conditions
          },
          relations: ['user'],
        });

        if (listing) {
          listingArrayMails.push(element.user.email);

          await this.searchHistoryRepository.update(element.id, {
            isValid: true,
          });

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
      console.log(userNotifications);

      // Send notifications for each user
      for (const notification of userNotifications) {
        this.eventEmiter.emit(NotificationEvent.SEND_NOTIFICATION, {
          creatorId: notification.id,
          scope: scope,
          event: 'Created',
          recipientFormat: ['User that has searched', null],
          type: null,
        });
      }

      // Optionally send bulk notifications (e.g., via email)
      // await this.mailService.sendSearchHistoryIsNowAvailable(listingArrayMails);

      // Optionally send push notifications
      // this.notificationService.sendUsersNotification({
      //   title: 'New listing',
      //   message: 'A listing that matches your search is now available',
      //   isEmail: false,
      //   isPushNotification: true,
      //   recipients: listingArrayUserId,
      //   deepLink: '',
      // });
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
      console.log(error);
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

  async notifyUsersAboutUpcomingAuctions() {
    try {
      const currentDate = new Date();

      const notificationPreference =
        await this.notificationScopeRepository.find();

      const scope = notificationPreference.find(
        (element) =>
          element.scopeGroup === NotificationScopesEnum.UPCOMING_AUCTION,
      );

      const batchSize = 100;
      let offset = 0;
      let usersBatch = []; // Declare usersBatch outside of the loop

      do {
        // Fetch users in batches
        usersBatch = await this.userRepository.find({
          select: ['id'],
          skip: offset,
          take: batchSize,
        });

        // Fetch auctions in batches
        let auctionOffset = 0;
        const auctionBatchSize = 100;
        let auctions = [];
        let auctionBatch;

        do {
          auctionBatch = await this.auctionRepository.find({
            order: { startDate: 'DESC' },
            where: {
              startDate: Between(
                currentDate,
                new Date(addDaysToDate(currentDate, 31)),
              ),
            },
            skip: auctionOffset,
            take: auctionBatchSize,
          });
          auctions = auctions.concat(auctionBatch);
          auctionOffset += auctionBatchSize;
        } while (auctionBatch.length > 0);

        // Filter auctions directly during query (alternative optimization)
        const oneMonthAuctions = auctions.filter(
          (auction) =>
            calculateDaysDifference(
              currentDate,
              new Date(auction.startDate),
            ) === 30,
        );

        const weeklyAuctions = auctions.filter(
          (auction) =>
            calculateDaysDifference(currentDate, new Date(auction.startDate)) %
              7 ===
            0,
        );

        // Process notifications for each user
        for await (const user of usersBatch) {
          const userNotifications = [];

          if (oneMonthAuctions.length > 0) {
            userNotifications.push({
              creatorId: user.id,
              scope,
              event: 'A month before',
              recipientFormat: ['All platform', null],
              type: null,
            });
          }

          if (weeklyAuctions.length > 0) {
            weeklyAuctions.forEach((auction) => {
              userNotifications.push({
                creatorId: user.id,
                scope,
                event: 'Weekly',
                recipientFormat: ['All platform', null],
                type: null,
                count: calculateDaysDifference(currentDate, auction.startDate),
              });
            });
          }

          // Emit notifications immediately
          for (const notification of userNotifications) {
            this.eventEmiter.emit(
              NotificationEvent.SEND_NOTIFICATION,
              notification,
            );
          }
        }

        offset += batchSize;
      } while (usersBatch.length > 0);
    } catch (error) {
      this.logger.error(
        'Failed to notify users about upcoming auctions',
        error,
      );
    }
  }

  async notifyUsersAboutStartOfAuctionsTheySubscribedTo() {
    const oneDayNotification = [];

    const auctions = await this.auctionParticipantRepository.find({
      where: {
        auction: {
          startDate: Between(
            new Date(),
            new Date(removeDaysFromDate(new Date(), 1)),
          ),
        },
        createdAt: LessThanOrEqual(new Date()),
      },
      relations: ['listing', 'listing.user'],
      select: {
        id: true,
        listing: {
          userId: true,
          user: {
            id: true,
            email: true,
          },
        },
      },
    });

    const notificationPreference =
      await this.notificationScopeRepository.find();
    //Filter out the correct scope
    const scope: NotificationScope = notificationPreference.find((element) => {
      if (element.name == NotificationScopesEnum.UPCOMING_AUCTION) {
        return element;
      }
    });

    auctions.forEach((element) => {
      if (
        element.auction.startDate == new Date(removeDaysFromDate(new Date(), 1))
      ) {
        oneDayNotification.push(element);
      }
    });

    auctions.forEach((element) => {
      if (oneDayNotification.length) {
        this.notificationService.prepareNotification({
          creatorId: element.listing.userId,
          scope: scope,
          event: scope.name,
          recipientFormat: ['Users enlisted to bid and sellers', null],
        });
      }
    });
  }

  async notifyUsersAboutStartOfAuctionsTheySubscribedTo12HoursBefore() {
    const oneDayNotification = [];

    const auctions = await this.auctionParticipantRepository.find({
      where: {
        auction: {
          startDate: Between(
            new Date(),
            new Date(removeDaysFromDate(new Date(), 0.5)),
          ),
        },
        createdAt: LessThanOrEqual(new Date()),
      },
      relations: ['listing', 'listing.user'],
      select: {
        id: true,
        listing: {
          userId: true,
          user: {
            id: true,
            email: true,
          },
        },
      },
    });

    const notificationPreference =
      await this.notificationScopeRepository.find();
    //Filter out the correct scope
    const scope: NotificationScope = notificationPreference.find((element) => {
      if (element.name == NotificationScopesEnum.UPCOMING_AUCTION) {
        return element;
      }
    });

    auctions.forEach((element) => {
      if (
        element.auction.startDate == new Date(removeDaysFromDate(new Date(), 1))
      ) {
        oneDayNotification.push(element);
      }
    });

    auctions.forEach((element) => {
      if (oneDayNotification.length) {
        this.eventEmiter.emit(NotificationEvent.SEND_NOTIFICATION, {
          creatorId: element.listing.userId,
          scope: scope,
          event: '12- Hour before',
          recipientFormat: ['Users enlisted to bid and sellers', null],
          type: null,
        });
      }
    });
  }
}
