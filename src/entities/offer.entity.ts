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
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';
import { Listing } from './listing.entity';
import { OfferListEnum } from '../common/enums/status.enum';
import { IsEnum } from 'class-validator';
import { Invoice } from './invoice.entity';
import { Finalization } from './finalization.entity';

@ObjectType()
@Entity()
export class Offer extends BaseEntity {
  @Column('decimal', { precision: 12, scale: 2 })
  @Field()
  price: number;

  @Column('decimal', { precision: 12, scale: 2 })
  @Field()
  saiiFee: number;

  @Column('simple-array', { default: [] })
  @Field(() => [Number])
  previousSaiiFee: number[];

  @Column('decimal', { precision: 12, scale: 2 })
  @Field()
  vat: number;

  @Field()
  @Column()
  expireAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ nullable: true })
  acceptedAt: Date;

  @Field({ defaultValue: OfferListEnum.INACTIVE })
  @IsEnum(OfferListEnum)
  @Column({ default: OfferListEnum.ACTIVE })
  status: string;

  @Field()
  @Column({ default: false })
  coupon: boolean;

  @Field()
  @Column({ default: true })
  isPaid: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  couponCode: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.offer)
  @Index()
  user: User;

  @Field(() => Listing)
  @JoinColumn({ name: 'listingId' })
  @Index()
  @ManyToOne(() => Listing, (listing) => listing.offer)
  @Index()
  listing: Listing;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  listingId: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Invoice, (listingType) => listingType.offer, {
    nullable: true,
  })
  @Field(() => Invoice, { nullable: true })
  invoice: Invoice;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Finalization, { nullable: true })
  @OneToOne(() => Finalization, (finalization) => finalization.offer)
  finalization: Finalization;
}
