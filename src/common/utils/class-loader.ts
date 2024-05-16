/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { User } from 'src/entities';

export const loadUserName = (user: User): string => {
  if (user.firstName || user.lastName || user.middleName) {
    return `${user.firstName} ${user.middleName ?? ''} ${user.lastName}`;
  } else if (
    user.arabicFirstName ||
    user.arabicLastName ||
    user.arabicMiddleName
  ) {
    return `${user.arabicFirstName} ${user.arabicMiddleName ?? ''} ${user.arabicLastName}`;
  }
  return '';
};
