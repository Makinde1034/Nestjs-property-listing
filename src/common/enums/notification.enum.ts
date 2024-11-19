/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

export enum NotificationType {
  EMAIL_NOTIFICATION = 'Email',
  PUSH_NOTIFICATION = 'Push Notification',
  SYSTEM_NOTIFICATION = 'System Notification',
  ALL = 'All',
}

export enum NotificationEvent {
  SEND_NOTIFICATION = 'send.notification',
}

export enum ServerSentEvents {
  SUCCESS = 'success',
  NOTIFICATION = 'notification',
}
export enum NotificationRecipients {
  OfferCreator = 'Offer Creator',
  Seller = 'Seller',
  ListingBidderAndSeller = 'Listing Bidder and Seller',
  Bidder = 'Bidder',
  UserWithSavedSearch = 'User that has searched',
  UserWithWishlist = 'User that has listing in wishlist',
  AllPlatform = 'All platform',
  UsersEnlistedToBidAndSellers = 'Users enlisted to bid and sellers',
  Payer = 'Payer',
  RegisteringUser = 'Registering user',
  Buyer = 'Buyer',
  ServiceProvider = 'Service Provider',
  ListingOwner = 'Listing Owner',
  AdminApprover = 'Admin Approver',
  AdminDealFinalizer = 'Admin Deal Finalizer',
  BothParties = 'Both Parties',
  AdminListingApprover = 'Admin listing approver',
  Owner = 'Owner',
}
