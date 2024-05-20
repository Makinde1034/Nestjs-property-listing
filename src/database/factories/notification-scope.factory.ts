/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import type { NotificationScope } from 'src/entities';

export const NotificationScopeFactory: NotificationScope[] = [
  {
    id: 1,
    scopeGroup: 'Offers',
    name: 'Create Offer',
    description: 'Receive Notification for when an offer is created',
  },
  {
    id: 2,
    scopeGroup: 'Offers',
    name: 'Update Offer',
    description: 'Receive Notification for when an offer is updated',
  },
  {
    id: 3,
    scopeGroup: 'Offers',
    name: 'Offer Response',
    description:
      'Receive Notification for when a response is given for an offer',
  },
  {
    id: 4,
    scopeGroup: 'Auctions',
    name: 'Bids',
    description: 'Receive Notification for Auction',
  },
  {
    id: 5,
    scopeGroup: 'Auctions',
    name: 'Results',
    description: 'Receive Notification for Auction',
  },
  {
    id: 6,
    scopeGroup: 'Auctions',
    name: 'Last minute',
    description: 'Receive Notification for Last minute Auction',
  },
  {
    id: 7,
    scopeGroup: 'Auctions',
    name: '15 minutes to end',
    description: 'Receive Notification for 15 minutes to end Auction',
  },
  {
    id: 9,
    scopeGroup: 'Listings',
    name: 'Created',
    description: 'Receive Notification for when a Listing is created',
  },
  {
    id: 10,
    scopeGroup: 'Listings',
    name: 'Price change',
    description: 'Receive Notification for when a Listing price changes',
  },
  {
    id: 11,
    scopeGroup: 'Auctions',
    name: 'Upcoming Auctions',
    description: 'Receive Notification for upcoming auctions',
  },
  {
    id: 12,
    scopeGroup: 'Invoices',
    name: 'Create Invoice',
    description: 'Receive Notification for created invoice',
  },
  {
    id: 13,
    scopeGroup: 'Registration',
    name: 'Registration',
    description: 'Receive Notification for newly registered user',
  },
  {
    id: 14,
    scopeGroup: 'Service Provider Application',
    name: 'Accepted',
    description: 'Receive Notification for when a Service Provider accepts',
  },
  {
    id: 15,
    scopeGroup: 'Service Provider Application',
    name: 'Delivered',
    description: 'Receive Notification for when a Service Provider delivers',
  },
];
