/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

export const AuctionBidRangeFactory = [
  {
    lowerBound: 0,

    upperBound: 1,

    increment: 1,
    heldAmount: 20,
  },

  {
    lowerBound: 1,

    upperBound: 5,

    increment: 10,
    heldAmount: 200,
  },

  {
    lowerBound: 5,

    upperBound: 10,

    increment: 25,

    heldAmount: 2000,
  },

  {
    lowerBound: 10,

    upperBound: 25,

    increment: 50,
    heldAmount: 20000,
  },

  {
    lowerBound: 25,

    upperBound: 50,

    increment: 100,
    heldAmount: 200000,
  },
];
