/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';
import { Listing } from './listing.entity';
@ObjectType()
@Entity()
export class Offer extends BaseEntity {
  @Field()
  @Column({ type: 'money' })
  offerPrice: number;
  @Field()
  @Column()
  expireAt: Date;
  @Field()
  @Column({ nullable: true })
  acceptedAt: Date;
  @Field()
  @Column({ default: 'pending' })
  status: string;
  @Field()
  @Column({ default: false })
  coupon: boolean;

  @Field()
  @Column({ nullable: true })
  couponCode: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.offer, { eager: true })
  user: User;

  @Field(() => Listing)
  @JoinColumn({ name: 'listingId' })
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
  createdAt: string;

  @Field()
  @DeleteDateColumn()
  deletedAt: string;

  @Field()
  @UpdateDateColumn()
  updatedAt: string;
}
