/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

export enum Purpose {
  RENT = 'rent',
  SALE = 'sale',
}

export enum Ownership {
  OWNER = 'owner',
  NOT_OWNER = 'power_of_attorney',
}

export enum RentingOption {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  BI_QUARTERLY = 'bi-quarterly',
  YEARLY = 'yearly',
}

export enum ListingType {
  PROPERTY = 'property',
  BUILDING = 'building',
  LAND = 'land',
  FARM = 'farm',
  VILLA = 'villa',
  APARTMENT = 'apartment',
  OTHERS = 'others',
}

export enum ListingFlagType {
  INAPPROPRIAT = 'inappropriate',
  FALSE_INFROMATION = 'false information',
  OTHERS = 'others',
}
