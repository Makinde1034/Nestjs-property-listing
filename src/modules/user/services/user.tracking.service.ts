/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';

import { UserTrackingRepository } from '../repositories/user-tracking-repository';

@Injectable()
export class UserTrackingService {
  constructor(private userTrackingRepository: UserTrackingRepository) {}

  async trackVisit(
    userId: string | null,
    pageVisited: string,
    ipAddress: string,
    userAgent: string,
    type: string,
  ) {
    const userVisit = await this.userTrackingRepository.findOne({
      where: { ipAddress: ipAddress },
    });

    if (userVisit) {
      const numberOfVisit = userVisit.numberOfVisit + 1;
      this.userTrackingRepository.update(userVisit.id, {
        numberOfVisit: numberOfVisit,
      });
    } else {
      const trackingData = this.userTrackingRepository.create({
        userId,
        pageVisited,
        ipAddress,
        userAgent,
        type,
        numberOfVisit: 1,
      });
      await this.userTrackingRepository.save(trackingData);
    }
  }
}
