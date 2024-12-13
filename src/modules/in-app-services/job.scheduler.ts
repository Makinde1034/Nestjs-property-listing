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
import { NotificationScopesEnum } from '../../common/enums/notification-scope.enum';
import { NotificationScope } from '../../entities';
import { AuctionParticipantRepository } from '../listing/repositories/auction-participant.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from '../../common/enums';
import { Auction } from '../../entities/auction-table.entity';

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

  @Cron(CronExpression.EVERY_10_SECONDS)
  async test() {
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

      searchHistory.forEach(async (element) => {
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
      let oneMonthNotification = [];
      let weeklyUpcomingAuction: Auction;
      const currentDate = new Date();

      const [users, auctions] = await Promise.all([
        this.userRepository.find({ select: ['id'] }),
        this.auctionRepository.find({
          order: { startDate: 'DESC' },
          take: 1,
          skip: 0,
          where: {
            startDate: Between(
              currentDate,
              new Date(addDaysToDate(currentDate, 31)),
            ),
          },
        }),
      ]);

      const notificationPreference =
        await this.notificationScopeRepository.find();

      //Filter out the correct scope
      const scope: NotificationScope = notificationPreference.find(
        (element) =>
          element.scopeGroup == NotificationScopesEnum.UPCOMING_AUCTION,
      );

      // Filter auctions for notifications based on time frames
      auctions.forEach((auction) => {
        const auctionStartDate = new Date(auction.startDate);

        const daysUntilStart = calculateDaysDifference(
          currentDate,
          auctionStartDate,
        );

        if (daysUntilStart % 7 == 0 || 0 == 0) {
          weeklyUpcomingAuction = auction;
        }
        if (daysUntilStart == 30) {
          oneMonthNotification.push(auction);
        }
      });

      // Send notifications to all users for applicable auctions
      users.forEach((user) => {
        if (oneMonthNotification.length > 0) {
          this.eventEmiter.emit(NotificationEvent.SEND_NOTIFICATION, {
            creatorId: user.id,
            scope: scope,
            event: 'A month before',
            recipientFormat: ['All platform', null],
            type: null,
          });
        }

        if (weeklyUpcomingAuction) {
          this.eventEmiter.emit(NotificationEvent.SEND_NOTIFICATION, {
            creatorId: user.id,
            scope: scope,
            event: 'Weekly',
            recipientFormat: ['All platform', null],
            type: null,
            count: calculateDaysDifference(
              currentDate,
              weeklyUpcomingAuction.startDate,
            ),
          });
        }
      });
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
