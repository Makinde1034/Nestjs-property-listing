/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Cron, CronExpression } from '@nestjs/schedule';
import { ListingService } from '../listing/services/listing.service';
import { SearchHistoryRepository } from '../listing/repositories/search-history.repository';
import { ListingRepository } from '../listing/repositories/listing.repository';
import { MailSendService } from '../mail/services/mail-service';
import { NotificationService } from '../notification/services';
import { MailgunEmailService } from '../mail/services/implementations';

export class JobService {
  constructor(
    private listingRepository: ListingRepository,
    private searchHistoryRepository: SearchHistoryRepository,

    private mailService: MailgunEmailService,
    private pushNotification: NotificationService,
  ) {}
  @Cron(CronExpression.EVERY_DAY_AT_8PM)
  async sendNotificationForNewListingBasedOnSearchHistory() {
    const listingArrayMails: string[] = [];
    const listingArrayUserId: string[] = [];
    const searchHistory = await this.searchHistoryRepository.find({
      where: { isValid: false },
      relations: ['user'],
    });
    for (const element of searchHistory) {
      const listing = await this.listingRepository.findOne({
        where: {
          city: element.location,
          price: element.price,
          numberOfBathrooms: element.numberOfBathrooms,
          numberOfRooms: element.numberOfRooms,
          purpose: element.type,
        },
        relations: ['user'],
      });
      if (listing) {
        listingArrayMails.push(element.user.email);
        await this.searchHistoryRepository.update(element.id, {
          isValid: true,
        });
        listingArrayUserId.push(element.user.id);
      }
    }

    await this.mailService.sendSearchHistoryIsNowAvailable(listingArrayMails);
    this.pushNotification.sendUsersNotification({
      title: 'New listing',
      message: 'A listing that matches  your search is now available',
      isEmail: false,
      isPushNotifcation: true,
      recipients: listingArrayUserId,
      deepLink: '',
    });
  }
}
