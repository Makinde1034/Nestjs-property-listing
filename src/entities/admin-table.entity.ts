/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import BaseEntity from './base.entity';
import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class AdminDefault extends BaseEntity {
  @Field({ nullable: true })
  @Column()
  minimumOfferPercentage: number;

  @Field({ nullable: true })
  @Column()
  street: string;

  @Field({ nullable: true })
  @Column()
  city: string;

  @Field({ nullable: true })
  @Column()
  promptRatingTime: number;

  @Field({ nullable: true })
  @Column()
  ticketAging: number;

  @Field({ nullable: true })
  @Column({ type: 'decimal' })
  saiiForSale: number;

  @Field({ nullable: true })
  @Column({ type: 'decimal' })
  saiiForRent: number;

  @Field({ nullable: true })
  @Column({ type: 'decimal' })
  vat: number;

  @Field({ nullable: true })
  @Column()
  paymentType: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  dataRetention: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  ratingPrompt: number;

  @Field({ nullable: true })
  @Column({ default: 100 })
  auctionHeldAmount: number;

  @Field({ nullable: true })
  @Column({ default: 1000 })
  fallBackDefaultBidIncrement: number;
  @Field({ nullable: true })
  @Column()
  state: string;
  @Field({ nullable: true })
  @Column()
  country: string;
  @Field({ nullable: true })
  @Column()
  countryISOCode: string;
  @Field({ nullable: true })
  @Column()
  postcode: string;

  @Field({ nullable: true })
  @Column()
  merchantTransactionId: string;

  @Field({ nullable: true })
  @Column()
  daysToAuctionRegistrationEnd: number;

  @Field()
  @Column({ default: 2 })
  maximumDaysForOfferExpiration: number;

  @Field({ nullable: true })
  @Column()
  daysToAuctionRegistrationStart: number;

  @Field({ nullable: true })
  @Column({ default: 5000 })
  rentalFee: number;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  minimumAppVersionIos: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  minimumAppVersionAndroid: string;
}
