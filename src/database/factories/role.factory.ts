/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DeepPartial } from 'typeorm';
import { Role } from '../../entities';

/******************************************************************
 *You have to refactor/ review role seeder if any role is added here
 *******************************************************************/
export const roleFactory: DeepPartial<Role[]> = [
  {
    englishName: 'Super Admin',
    arabicName: 'مشرف عام',
    slug: 'super-admin',
    permissions: [],
    user: null,
  },
];
