/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import type { User, Role } from 'src/entities';
import * as bcrypt from 'bcrypt';
import { UserStatus } from '../../common/enums';

export const SuperAdminData: Partial<User> = {
  firstName: 'Super',
  lastName: 'Admin',
  email: 'admin@waseet.com',
  password: bcrypt.hashSync('Waseet@2024', 10),
  verifiedAt: new Date(),
  userType: 'admin',
  phone: '+1100299111',
  currentTermOfservice: 'v1',
  termsOfServiceVersion: 'v1',
  userLevel: 'level_2',
  isTwoFactorAuthenticationEnabled: true,
  status: UserStatus.VERIFIED,
};
