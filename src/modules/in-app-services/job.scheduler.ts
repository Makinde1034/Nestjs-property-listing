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
import { Offer } from '../../entities/offer.entity';

import { UserRepository } from '../user/repositories';
import { formatDate } from 'date-fns';

export class JobService {
  constructor(
    private userRepository: UserRepository,
    private listingRepository: ListingRepository,
    private searchHistoryRepository: SearchHistoryRepository,

    private mailService: MailgunEmailService,
    private pushNotification: NotificationService,

    private offerRepository: OfferRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8PM)
  async sendNotificationForNewListingBasedOnSearchHistory() {
    const listingArrayMails: string[] = [];
    const listingArrayUserId: string[] = [];
    const searchHistory = await this.searchHistoryRepository.find({
      where: { isValid: false },
      relations: ['user'],
    });
    searchHistory.map(async (element) => {
      const listing = await this.listingRepository.findOneOrFail({
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

    /**************************
     * Update expired offers
     *
     **************************/
    await this.offerRepository
      .createQueryBuilder('offer')
      .update(Offer)
      .set({ status: 'expired' })
      .where('offer.expireAt > :date', { date: new Date() })
      .execute();
  }

  @Cron(CronExpression.EVERY_DAY_AT_8PM)
  async sendAlertOnIncompleteOffers() {
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
  }
}
