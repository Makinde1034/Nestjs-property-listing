import { Injectable } from '@nestjs/common';
import { ListingRepository } from '../listing/repositories/listing.repository';
import { OfferRepository } from '../listing/repositories';

import { OfferListEnum } from '../../common/enums/status.enum';
import { UserRepository } from '../user/repositories';
@Injectable()
export class AdminService {
  constructor(
    private readonly listingRepository: ListingRepository,
    private readonly offerRepository: OfferRepository,
    private userRepository: UserRepository,
  ) {}

  async getResponseTime() {}

  async listingStats() {
    const [offer, listing, acceptedOffer, ownershipTransfer] =
      await Promise.all([
        await this.offerRepository.count(),
        await this.listingRepository.count(),
        await this.offerRepository.count({
          where: {
            status: OfferListEnum.EXPIRED,
          },
        }),
        await this.listingRepository.count({ where: { isListingSold: true } }),
      ]);

    const analysis = { offer, listing, acceptedOffer, ownershipTransfer };
    return analysis;
  }

  async userStats() {
    const [users] = await Promise.all([await this.userRepository.count()]);

    const analysis = { users };

    return analysis;
  }

  async userFunneling() {
    const [user] = await Promise.all([
      await this.userRepository.count({
        where: {},
      }),
    ]);

    const analysis = { user };

    return analysis;
  }

  async userDashBoard() {}
}
