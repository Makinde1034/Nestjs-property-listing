/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

// Export enum NotificationScopesEnum {
//   CREATE_OFFER = 'Create',
//   UPDATE_OFFER = 'Update',
//   OFFER_RESPONSE = 'Response',

//   BID_PLACED = 'Bids',
//   AUCTION_RESULT = 'Results',

//   AUCTION_LAST_MINUTE = 'Last minute',
//   AUCTION_FIFTEEN_MINUTES = '15 minutes to end',

//   LISTING_CREATED = 'Created',
//   LISTING_PRICE_CHANGE = 'Price change',
//   UPCOMING_AUCTION = 'Upcoming Auctions',

//   INVOICE_CREATED = 'Create Invoice',
//   REGISTRATION_VERIFICATION = 'Registration',

//   SERVICE_PROVIDER_ACCEPTED = 'Accepted',
//   SERVICE_DELIVERED = 'Delivered',
//   REQUEST_STATUS_CHANGED = 'Request Status Change',
//   RENTAL_PENDING = 'Rental Pending',
//   SALE_PENDING = 'Sale Pending',
//   CONTRACT_CONFIRMATION = 'Confirm Contract',
//   LISTING_APPROVED = 'Approved',
//   LISTING_DENIED = 'Denied',

//   WORKFLOW_EVENT = 'Workflow Event',

//   LISTING_IN_SAVED_SEARCHES = 'Listings in Saved searches',
// }

// Export enum NotificationTitlesEnum {
//   OFFER_CREATED = 'Offer Created',
//   OFFER_EDITED = 'Offer Edited',
//   OFFER_RESPONSE = 'Offer Response',

//   NEW_BID = 'New Bid',
//   LOST_BID = 'You have lost',
//   WON_BID = 'You have won',

//   LISTING_PURCHASED = 'Listing Purchased',
//   NO_BIDS = 'No Bids',

//   LAST_MINUTE_WARNING = 'Last Minute!',
//   FIFTEEN_MINUTES_LEFT = '15 minutes left!',

//   LISTING_CREATED = 'Listing Created!',
//   PRICE_CHANGED = 'Price Changed!',

//   AUCTION_ALERT_1 = 'Auction Alert',

//   SUCCESSFUL_PAYMENT = 'Successful Payment',
//   VERIFY_EMAIL = 'Verify Your Email',

//   FINALIZE_PURCHASE = 'Finalize Your Purchase',
//   COMPLETE_AUCTION_PURCHASE = 'Complete Auction Purchase',

//   CONFIRM_AUCTION_CONTRACT = 'Confirm Auction Contract',
//   CONFIRM_SALE_CONTRACT = 'Confirm Sale Contract',
//   SIGN_SERVICE_CONTRACT = 'Sign Your Service Contract',

//   CONFIRM_SERVICE_COMPLETION = 'Confirm Service Completion',

//   REQUEST_APPROVAL = 'Request for Approval',
//   SALE_PENDING = 'Sale Pending',
//   RENTAL_PENDING = 'Rental Pending',

//   REQUEST_STATUS_CHANGE = 'Request Status Change',

//   NEW_LISTING = 'New Listing',
//   LISTING_PUBLISHED = 'Listing Published',
//   LISTING_DENIED = 'Listing Denied',
// }

export enum NotificationScopeEnum {
  OFFERS = 'Offers',
  LIVE_AUCTION = 'Live Auction',
  LISTINGS_IN_SAVED_SEARCHES = 'Listings in Saved searches',
  LISTINGS_IN_WISHLIST = 'Listings in Wishlist',
  UPCOMING_AUCTIONS = 'Upcoming Auctions',
  INVOICES = 'Invoices',
  REGISTRATION = 'Registration',
  AUCTION = 'Auctions',
  SERVICE_PROVIDER_APPLICATION = 'Service Provider Application',
  SERVICE = 'Service',
  WORKFLOW_EVENTS = 'Workflow events',
  REQUEST_CREATED = 'Request Created',
  REQUESTS_MANAGEMENT = 'Requests Management',
  LISTING = 'Listing',
}
