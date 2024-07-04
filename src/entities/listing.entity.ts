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
import { Exclude } from 'class-transformer';
import { Offer } from './offer.entity';
import { Promotion } from './promotion.entity';
import { FlagListing } from './flag-listing.entity';
import { ListingStatus } from '../common/enums/status.enum';
import { Feature } from './feature.entity';
import { Wishlist } from './wishlist.entity';

@Entity()
@ObjectType()
export class Listing extends BaseEntity {
  @Column()
  @Field()
  ownership: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  purpose: string;

  @Column({ default: 'rent' })
  @Field({ defaultValue: 'rent' })
  sellingType: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  powerOfAttorney: string;

  @Field({ defaultValue: 'property' })
  @Column({ default: 'property' })
  listingType: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  rentingOption: string;

  @Column()
  @Field()
  propertyNumber: string;

  @Column()
  @Field()
  deedNumber: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  districtCity: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  city: string;

  @Field()
  @Column({ nullable: true })
  country: string;

  @Column()
  @Field()
  propertySize: string;

  @Column()
  @Field()
  price: string;

  @Column()
  @Field()
  @Exclude()
  publicationDate: string;

  @Column()
  @Field()
  numberOfBathrooms: string;

  @Column()
  @Field()
  numberOfRooms: string;

  @Column({ type: 'jsonb', nullable: true })
  @Field({ nullable: true })
  images: string;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-array', nullable: true })
  panoramaView: string[];

  @Field(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User, (user) => user.reviewer)
  user: User;

  @Field(() => [Offer], { nullable: true })
  @OneToMany(() => Offer, (offer) => offer.listing, {
    cascade: true,
  })
  offer: Offer[];

  @Column()
  @Field()
  userId: string;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  amenities: string[];

  @Field()
  @Column({ type: 'jsonb', nullable: true })
  gpsCoordinates: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  district: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  street: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  buildingNumber: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  floor: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  landArea: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  numberOfApartment: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  numberOfStoreys: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  areaOfApartment: string;

  @Column({ default: false })
  @Field({ defaultValue: false })
  garageArea: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  garageSize: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  totalArea: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  rentedApartment: string;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  negotiatable: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  pool: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  outdoorKitchen: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  garden: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  guestHouse: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  tennisCourt: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  basketballCourt: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  jacuzzi: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  bbqArea: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  maidsRoom: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  petsAllowed: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  balcony: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  gym: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  playground: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  parking: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  security: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  airConditioning: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  storageRoom: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  laundryRoom: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  conferenceRoom: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  gatedCommunity: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  indoorPlayArea: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  coveredParking: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  wifi: boolean;

  @Column({ type: 'boolean', default: false })
  @Field({ nullable: true })
  elevator: boolean;
  @Field(() => [Promotion])
  @OneToMany(() => Promotion, (promotion) => promotion.listing, {
    cascade: true,

    onDelete: 'CASCADE',
  })
  promotion: Promotion[];

  @Field(() => [Feature])
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
  promoted: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  promotionExpiration: Date;

  @Field({ defaultValue: false })
  @Column({ default: false })
  isListingFlagged: boolean;

  @Field({ defaultValue: false })
  @Column({ default: false })
  isDisabled: boolean;

  @Field({ defaultValue: 'active', nullable: true })
  @Column({ enum: ListingStatus, default: 'active', nullable: true })
  status: string;

  @Field(() => [FlagListing], { nullable: true })
  @OneToMany(() => FlagListing, (flag) => flag.listing, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  flag: FlagListing[];

  @Field(() => [Wishlist])
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
  promotedDate: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  featureExpiration: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  featureDate: Date;

  @Index()
  @Column({ nullable: true })
  @Field({ nullable: true })
  @Index()
  flaggedDate: Date;

  @Column({ default: false })
  @Field({ defaultValue: false })
  featured: boolean;

  @Field()
  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Field()
  @DeleteDateColumn()
  deletedAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
