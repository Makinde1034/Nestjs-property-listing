/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import type { NotificationScope } from 'src/entities';

export const NotificationScopeFactory: NotificationScope[] = [
  {
    id: 1,
    scopeGroup: 'Offers',
    name: 'Create',
    description: 'Receive notification when an offer is created',
  },
  {
    id: 2,
    scopeGroup: 'Offers',
    name: 'Update',
    description: 'Receive notification when an offer is updated',
  },
  {
    id: 3,
    scopeGroup: 'Offers',
    name: 'Response',
    description: 'Receive notification for response on an offer',
  },
  {
    id: 4,
    scopeGroup: 'Offers',
    name: 'Accepted',
    description: 'Receive notification when an offer is accepted',
  },
  {
    id: 5,
    scopeGroup: 'Auctions',
    name: 'Bids',
    description: 'Receive notification for a new bid in live auctions',
  },
  {
    id: 6,
    scopeGroup: 'Auctions',
    name: 'Results',
    description: 'Receive notification for auction results',
  },
  {
    id: 7,
    scopeGroup: 'Auctions',
    name: 'Last minute',
    description: 'Receive notification for the last minute of live auctions',
  },
  {
    id: 8,
    scopeGroup: 'Auctions',
    name: '15 minutes to end',
    description:
      'Receive notification for the last 15 minutes of live auctions',
  },
  {
    id: 9,
    scopeGroup: 'Listings',
    name: 'Created',
    description: 'Receive notification when a listing is created',
  },
  {
    id: 10,
    scopeGroup: 'Listings',
    name: 'Price change',
    description: 'Receive notification for price changes on listings',
  },
  {
    id: 11,
    scopeGroup: 'Upcoming Auctions',
    name: 'Monthly Reminder',
    description: 'Receive notification one month before an auction event',
  },
  {
    id: 12,
    scopeGroup: 'Upcoming Auctions',
    name: 'Weekly Reminder',
    description: 'Receive weekly countdown reminders for upcoming auctions',
  },
  {
    id: 13,
    scopeGroup: 'Upcoming Auctions',
    name: 'Daily Reminder',
    description: 'Receive daily countdown reminders for upcoming auctions',
  },
  {
    id: 14,
    scopeGroup: 'Upcoming Auctions',
    name: '12-Hour Reminder',
    description: 'Receive notification 12 hours before an auction event',
  },
  {
    id: 15,
    scopeGroup: 'Invoices',
    name: 'Create',
    description: 'Receive notification when a new invoice is created',
  },
  {
    id: 16,
    scopeGroup: 'Registration',
    name: 'Email Verification',
    description: 'Receive notification to verify email upon registration',
  },
  {
    id: 17,
    scopeGroup: 'Service Provider Application',
    name: 'Accepted',
    description:
      'Receive notification when a service provider application is accepted',
  },

  {
    id: 18,
    scopeGroup: 'Service',
    name: 'Delivered',
    description: 'Receive notification when a service is delivered',
  },

  {
    id: 19,
    scopeGroup: 'Workflow Events',
    name: 'Approval Request',
    description: 'Receive notification for admin approval requests',
  },

  {
    id: 20,
    scopeGroup: 'Request Management',
    name: 'Sale Pending',
    description: 'Receive notification for pending sales requests',
  },
  {
    id: 21,
    scopeGroup: 'Request Management',
    name: 'Rental Pending',
    description: 'Receive notification for pending rental requests',
  },
  {
    id: 22,
    scopeGroup: 'Request Management',
    name: 'Status Change',
    description: 'Receive notification for changes in request status',
  },
  {
    id: 23,
    scopeGroup: 'Listing',
    name: 'Approval',
    description: 'Receive notification for listing approval requests',
  },
  {
    id: 24,
    scopeGroup: 'Listing',
    name: 'Published',
    description: 'Receive notification when a listing is published',
  },
  {
    id: 25,
    scopeGroup: 'Listing',
    name: 'Denied',
    description: 'Receive notification when a listing is denied',
  },
  {
    id: 26,
    scopeGroup: 'Listings in Saved searches',
    name: 'Created',
    description: 'Receive notification when search is available',
  },
];
