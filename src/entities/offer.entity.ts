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
  @Column('decimal', { precision: 10, scale: 2, default: 1300 })
  @Field()
  price: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.5 })
  @Field()
  saiiFee: number;

  @Field()
  @Column()
  expireAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  acceptedAt: Date;

  @Field({ defaultValue: OfferListEnum.INACTIVE })
  @IsEnum(OfferListEnum)
  @Column({ default: OfferListEnum.ACTIVE })
  status: string;

  @Field()
  @Column({ default: false })
  coupon: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  couponCode: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.offer)
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
