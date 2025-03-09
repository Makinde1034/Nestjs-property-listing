/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { int } from 'aws-sdk/clients/datapipeline';
import { PaymentStatus } from '../common/enums/status.enum';
import { Listing } from './listing.entity';
import { ListingType } from './listing-type.entity';
import { Offer } from './offer.entity';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class Invoice {
  @PrimaryGeneratedColumn()
  @Field()
  id: int;

  @Column('decimal', { precision: 17, scale: 2 })
  @Field()
  price: number;

  @Column('decimal', { precision: 17, scale: 2, nullable: true })
  @Field({ nullable: true })
  capturedPrice: number;

  @Column()
  @Field()
  userId: string;

  @Column({ default: '' })
  @Field()
  checkoutId: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  offerId: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  reference?: string;

  @ManyToOne(() => Listing, { nullable: true })
  @JoinColumn({ name: 'listingId' })
  @Field(() => Listing, { nullable: true })
  listing?: Listing;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  @Field(() => User, { nullable: true })
  user: User;

  @ManyToOne(() => ListingType, (listingType) => listingType.invoice, {
    nullable: true,
  })
  @JoinColumn({ name: 'listingTypeId' })
  @Field(() => ListingType, { nullable: true })
  listingType?: ListingType;

  @OneToOne(() => Offer, (offer) => offer.invoice, {
    nullable: true,
  })
  @JoinColumn({ name: 'offerId' })
  @Field(() => Offer, { nullable: true })
  offer?: Offer;

  @Column({ default: 'Saii Fees' })
  @Field()
  type?: string;

  @Column({ enum: PaymentStatus, default: 'pending' })
  @Field()
  status: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  file: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  listingTypeId: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  listingId: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @Field()
  vat: number;
  @Column()
  @Field(() => GraphQLISODateTime, { nullable: true })
  @CreateDateColumn()
  expireAt: Date;

  @Column()
  @Field(() => GraphQLISODateTime, { nullable: true })
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;
}
