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
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';
import { Listing } from './listing.entity';
import { OfferListEnum } from '../common/enums/status.enum';
import { IsEnum } from 'class-validator';
@ObjectType()
@Entity()
export class Offer extends BaseEntity {
  @Field()
  @Column({ nullable: true })
  offerPrice: number;

  @Field()
  @Column({ nullable: true })
  expireAt: Date;

  @Field()
  @Column({ nullable: true })
  acceptedAt: Date;

  @Field({ defaultValue: 'active' })
  @IsEnum(OfferListEnum)
  @Column({ default: 'active' })
  status: string;

  @Field()
  @Column({ default: false })
  coupon: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  couponCode: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.offer, { eager: true })
  user: User;

  @Field(() => Listing)
  @JoinColumn({ name: 'listingId' })
  @Index()
  @ManyToOne(() => Listing, (listing) => listing.offer)
  listing: Listing;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  listingId: string;

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
