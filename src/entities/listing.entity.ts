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
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

import { Offer } from './offer.entity';
import { Promotion } from './promotion.entity';
import { FlagListing } from './flag-listing.entity';
import { Feature } from './feature.entity';
import { Wishlist } from './wishlist.entity';
import { ListingType } from './listing-type.entity';
import { ListingAttributes } from './listing-attributes.entity';

@Entity()
@ObjectType()
export class Listing extends BaseEntity {
  @Column()
  @Field()
  ownership: string;

  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  purpose: string;

  @Column()
  @Field()
  price: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deedNumber: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  poaNumber: string;

  @Column()
  @Field()
  rentingOption: string;

  @Column()
  @Field()
  iban: string;

  @Column()
  @Field()
  zatcaNumber: string;

  @Field(() => ListingType)
  @JoinColumn({ name: 'listingTypeId' })
  @ManyToOne(() => ListingType, (listingType) => listingType.listing, {
    eager: true,
  })
  listingType: ListingType[];

  @Field()
  @Column()
  listingTypeId: string;

  @Column()
  @Field()
  city: string;

  @Field()
  @Column()
  country: string;

  @Column()
  @Field()
  street: string;

  @Column()
  @Field()
  district: string;

  @Field({ nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  gpsCoordinate: string;

  @Field(() => [ListingAttributes], { nullable: true })
  @OneToMany(
    () => ListingAttributes,
    (listingAttributes) => listingAttributes.listing,
    { onDelete: 'CASCADE' },
  )
  listingAttributes: ListingAttributes[];

  @Column({ type: 'jsonb', nullable: true })
  @Field({ nullable: true })
  images: string;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-array', nullable: true })
  panoramaView: string[];

  @Field(() => User, { nullable: true })
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
  @Field()
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

  @Field({ defaultValue: 0 })
  @Column({ default: 0 })
  impressions: number;

  @Field({ defaultValue: false })
  @Column({ default: false })
  isListingPromoted: boolean;

  @Field({ defaultValue: false })
  @Column({ default: false })
  isListingFlagged: boolean;

  @Field({ defaultValue: false })
  @Column({ default: false })
  isListingSold: boolean;

  @Field({ defaultValue: false })
  @Column({ default: false })
  isListingRented: boolean;

  @Field({ defaultValue: false })
  @Column({ default: false })
  isListingFeatured: boolean;

  @Field({ defaultValue: false })
  @Column({ default: false })
  isListingDisabled: boolean;

  @Field({ defaultValue: false })
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
  @Field({ nullable: true })
  rentDate: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  soldDate: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  furnished: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  promotedDate: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  featureDate: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  @Index()
  flaggedDate: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  featureExpiration: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  promotionExpiration: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @DeleteDateColumn()
  deletedAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
