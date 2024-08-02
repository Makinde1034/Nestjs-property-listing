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
  countryISOCode: 'EG',
  postcode: '4240111',
};
