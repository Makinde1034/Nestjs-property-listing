/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { registerEnumType } from '@nestjs/graphql';

export enum ServicesOffered {
  LISTING = 'Create Listing',
  RENTING = 'Renting',
  BUYING = 'Buying',
  MAKE_OFFER = 'Making offer',
}

registerEnumType(ServicesOffered, {
  name: 'ServicesOffered',
});
