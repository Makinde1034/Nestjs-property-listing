/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

import { Offer } from './offer.entity';
import { Promotion } from './promotion.entity';
import { FlagListing } from './flag-listing.entity';
import { Feature } from './feature.entity';
import { Wishlist } from './wishlist.entity';
import { ListingType } from './listing-type.entity';
import { ListingAttributes } from './listing-attributes.entity';
import { GpsCoordinate } from './gps-coordinates.entity';
import { AuctionParticipant } from './auction-participant.entity';
import { ActivityLog } from './activity-log.entity';
import { Invoice } from './invoice.entity';
import { ServiceRequested } from './service-requested.entity';
import { ListingStage } from '../common/enums';
import { ListingStatus } from '../common/enums/status.enum';
import { Place } from './place.entity';

@Entity()
@ObjectType()
export class Listing extends BaseEntity {
  @Column()
  @Field({ nullable: true })
  @Index()
  ownership: string;

  @Column()
  @Field({ nullable: true })
  title: string;

  @Column()
  @Field({ nullable: true, defaultValue: '' })
  @Index()
  purpose: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @Field({ nullable: true })
  @Index()
  price: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deedNumber: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  poaNumber: string;

  @Column()
  @Field({ nullable: true })
  @Index()
  rentingOption: string;

  @Field(() => [ServiceRequested])
  @OneToMany(
    () => ServiceRequested,
    (serviceRequested) => serviceRequested.listing,
  )
  serviceRequested: ServiceRequested[];

  @Field(() => AuctionParticipant)
  @OneToOne(() => AuctionParticipant, (listing) => listing.listing)
  auctionParticipant: AuctionParticipant;

  @Field(() => Invoice, { nullable: true })
  @OneToOne(() => Invoice, (invoice) => invoice.listing, { nullable: true })
  invoice: Invoice;

  @Field(() => ListingType, { nullable: true })
  @JoinColumn({ name: 'listingTypeId' })
  @ManyToOne(() => ListingType, (listingType) => listingType.listing, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Index()
  listingType: ListingType;

  @Field({ nullable: true })
  @Index()
  @Column()
  listingTypeId: string;

  @Field(() => GpsCoordinate, { nullable: true })
  @OneToOne(() => GpsCoordinate, (gpsCoordinate) => gpsCoordinate.listing, {
    onDelete: 'CASCADE',
  })
  gpsCoordinate: GpsCoordinate;

  @Field(() => [ListingAttributes], { nullable: true })
  @OneToMany(
    () => ListingAttributes,
    (listingAttributes) => listingAttributes.listing,
    { onDelete: 'CASCADE', eager: true },
  )
  listingAttributes: ListingAttributes[];

  @Column({ type: 'jsonb', nullable: true })
  @Field({ nullable: true })
  images: string;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-array', nullable: true })
  panoramaView: string;

  @Field(() => User, { nullable: true })
  @Index()
  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User, (user) => user.listing)
  user: User;

  @Field(() => [Offer], { nullable: true })
  @OneToMany(() => Offer, (offer) => offer.listing, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  offer: Offer[];

  @Column()
  @Index()
  @Field({ nullable: true })
  userId: string;

  @Field(() => [Promotion], { nullable: true })
  @OneToMany(() => Promotion, (promotion) => promotion.listing, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  promotion: Promotion[];

  @Field(() => [Feature], { nullable: true })
  @OneToMany(() => Feature, (promotion) => promotion.listing, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  feature: Feature[];

  @Field({ defaultValue: 0, nullable: true })
  @Column({ default: 0 })
  impressions: number;

  @Field()
  @Index()
  @Column({ default: false })
  isListingPromoted: boolean;

  @Field()
  @Index()
  @Column({ default: false })
  isListingFlagged: boolean;

  @Field({ nullable: true })
  @Index()
  @Column({ default: false })
  isListingVerified: boolean;

  @Field()
  @Index()
  @Column({ default: false })
  isListingSold: boolean;

  @Field()
  @Index()
  @Column({ default: false })
  isListingRented: boolean;

  @Field()
  @Index()
  @Column({ default: false })
  isListingFeatured: boolean;

  @Field()
  @Index()
  @Column({ default: false })
  isListingDisabled: boolean;

  @Field({ nullable: true })
  @Column({ default: false })
  negotiable: boolean;

  @Field(() => [FlagListing], { nullable: true })
  @OneToMany(() => FlagListing, (flag) => flag.listing, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  flag: FlagListing[];

  @Field(() => [Wishlist], { nullable: true })
  @OneToMany(() => Wishlist, (wishlist) => wishlist.listing)
  wishlist: Wishlist[];

  @Column({ nullable: true })
  @Field(() => GraphQLISODateTime, { nullable: true })
  rentDate: Date;

  @Column({ nullable: true })
  @Field(() => GraphQLISODateTime, { nullable: true })
  soldDate: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  furnished: string;

  @Column({ nullable: true })
  @Field(() => GraphQLISODateTime, { nullable: true })
  promotedDate: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  promotionPrice: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  bundleType: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  bundleImpression: string;

  @Column({ nullable: true })
  @Field(() => GraphQLISODateTime, { nullable: true })
  featureDate: Date;

  @Column({ default: true })
  @Field()
  published: boolean;
  @Field()
  @Column({ default: false })
  publishable: boolean;

  @Column({ default: ListingStage.LISTED })
  @Field({ nullable: true })
  stage: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  reason: string;

  @Column({ default: ListingStatus.PENDING })
  @Field({ nullable: true })
  status: string;

  @Column({ nullable: true })
  @Field(() => GraphQLISODateTime, { nullable: true })
  @Index()
  flaggedDate: Date;

  @Field({ nullable: true })
  offers: number;

  @Column({ nullable: true })
  @Field(() => GraphQLISODateTime, { nullable: true })
  featureExpiration: Date;

  @Column({ nullable: true })
  @Field(() => GraphQLISODateTime, { nullable: true })
  promotionExpiration: Date;
  @Field(() => [ActivityLog], { nullable: true })
  @OneToMany(() => ActivityLog, (activityLogs) => activityLogs.listing)
  listingActivityLogs: ActivityLog;
  @Field(() => [Place])
  @OneToMany(() => Place, (place) => place.listing)
  place: Place[];
  @Field(() => GraphQLISODateTime, { nullable: true })
  @Index()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;
}
