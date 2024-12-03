/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Listing } from '../../../../entities';
import { Offer } from '../../../../entities/offer.entity';
import { IsArray } from 'class-validator';
@ObjectType()
export class UserCity {
  @Field({ nullable: true })
  user_city: string;
  @Field({ nullable: true })
  total: number;
}

@ObjectType()
export class ResponseTime {
  @Field({ nullable: true })
  averageCloseTime: number;
  @Field({ nullable: true })
  averageSupportTime: number;
}
@ObjectType()
export class UserDemography {
  @Field({ nullable: true })
  total: number;

  @Field(() => [UserCity], { nullable: true })
  userDemography: UserCity[];
}
@ObjectType()
export class Analysis {
  @Field({ nullable: true })
  offer: number;
  @Field({ nullable: true })
  listing: number;
  @Field({ nullable: true })
  acceptedOffer: number;
  @Field({ nullable: true })
  ownershipTransfer: number;
}

@ObjectType()
export class ListingStats {
  @Field(() => [Offer], { nullable: true })
  offers: Offer[];

  @Field()
  total: number;

  @Field()
  analysis: Analysis;
}
@ObjectType()
export class Group {
  @Field({ nullable: true })
  type: string;
  @Field({ nullable: true })
  fees: number;
}

@ObjectType()
export class SaiiFees {
  @Field({ nullable: true })
  total: number;
  @Field(() => [Group], { nullable: true })
  group: Group[];
}

@ObjectType()
export class UserFunneling {
  @Field({ nullable: true })
  guest: number;

  @Field({ nullable: true })
  levelOne: number;

  @Field({ nullable: true })
  levelTwo: number;

  @Field({ nullable: true })
  converged: number;
}

@ObjectType()
export class UserAgeRange {
  @Field({ nullable: true })
  age_range: string;

  @Field({ nullable: true })
  count: number;
}

@ObjectType()
export class UserStats {
  users: number;
}

@ObjectType()
export class UserCountryCount {
  @Field({ nullable: true })
  nationality: string;

  @Field({ nullable: true })
  count: number;
}

@ObjectType()
export class UserGenderCount {
  @Field({ nullable: true })
  gender: string;
  @Field({ nullable: true })
  count: number;
}

@ObjectType()
export class AdminDashboard {
  @Field({ nullable: true })
  listings: ListingStats;

  @Field({ nullable: true })
  userDemography: UserDemography;

  @Field({ nullable: true })
  userFunneling: UserFunneling;

  @Field({ nullable: true })
  saiiFees: SaiiFees;

  @Field({ nullable: true })
  averageCloseTime: number;

  @Field({ nullable: true })
  averageSupportTime: number;
}

@ObjectType()
export class FinancialVsOrderResponse {
  @Field({ nullable: true })
  fee?: string; // The fee type (e.g., "Saii Fees").

  @Field({ nullable: true })
  totalAmount: number; // Total amount for this fee type.

  @Field({ nullable: true })
  totalOrder: number; // Total orders for this fee type.
}

@ObjectType()
export class Data {
  @Field(() => [FinancialVsOrderResponse], { nullable: true }) // Array of FinancialVsOrderResponse
  @IsArray()
  data: FinancialVsOrderResponse[];
}

@ObjectType()
export class FinancialVsOrder {
  @Field(() => [Data], { nullable: true }) // Array of Data objects
  @IsArray()
  data: Data[];
}
@ObjectType()
export class GroupTransactions {
  @Field({ nullable: true })
  key: string;

  @Field(() => [FinancialVsOrderResponse], { nullable: true }) // Array of Data objects
  data: [FinancialVsOrderResponse];
}

export class CouponResponse {
  valid: boolean;
  amount: number;
}
