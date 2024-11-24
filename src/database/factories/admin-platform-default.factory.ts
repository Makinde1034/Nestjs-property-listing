/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { AdminDefault } from '../../entities/admin-table.entity';

export const AdminPlatformDefaultFactory: Partial<AdminDefault> = {
  minimumOfferPercentage: 80,
  street: '2 fake street',
  city: 'cario',
  state: 'cario',
  country: 'Egypt',
  countryISOCode: 'SAR',
  paymentType: 'DB',
  saiiForRent: 2.5,
  saiiForSale: 2.5,
  ticketAging: 24,
  promptRatingTime: 10,
  vat: 15,
  daysToAuctionRegistrationStart: 7,
  daysToAuctionRegistrationEnd: 7,
  postcode: '4240111',
  merchantTransactionId: 'WASEET-2024-PI',
};
