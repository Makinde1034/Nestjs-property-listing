/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DeepPartial } from 'typeorm';
import { Role } from '../../entities';

/******************************************************************
 *You have to refactor role seeder if any role is added here
 *******************************************************************/
export const roleFactory: DeepPartial<Role[]> = [
  {
    id: 1,
    englishName: 'Super Admin',
    arabicName: 'مشرف عام',
    slug: 'super-admin',
    permissions: [],
    user: null,
  },
  {
    id: 2,
    englishName: 'Request finalizer',
    arabicName: 'المُصَفِّي الطَّلَب',
    slug: 'request-finalizer',
    permissions: [],
    user: null,
  },
];
