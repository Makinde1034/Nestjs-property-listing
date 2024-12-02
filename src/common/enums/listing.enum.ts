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

export enum AdminSortListingManagement {
  RENTED = 'rentDate',
  SOLD = 'soldDate',
  PROMOTED = 'promotedDate',
  CREATED = 'createdAt',
  FLAGGED = 'flaggedDate',
}
export enum ListingStage {
  LISTED = 'Listed',
  OFFER_CREATED = 'Offer Created',
  OWNERSHIPS_TRANSFER = 'Ownership Transfer',
  OFFER_ACCEPTED = 'Offer Accepted',
}

export enum FurnishingStatusEnum {
  ALL_FURNISHED = 'all-furnished',
  FURNISHED = 'furnished',
  UN_FURNISHED = 'unfurnished',
}
