/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
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
import { Auction } from './auction-table.entity';
import BaseEntity from './base.entity';
import { Listing } from './listing.entity';
import { Bids } from './bids.entity';

@Entity()
@ObjectType()
export class AuctionParticipant extends BaseEntity {
  @Field()
  @Column()
  @Index()
  listingId: string;

  @Field()
  @Column()
  @Index()
  auctionId: string;

  @Field(() => [String], { nullable: true })
  userId: string[];

  @Field({ nullable: true })
  bidCount: number;

  @Field(() => Listing, { nullable: true })
  @JoinColumn({ name: 'listingId' })
  @ManyToOne(() => Listing, (listing) => listing.auctionParticipant)
  listing: Listing;

  @Field()
  @Column({ default: 0 })
  startingPrice: number;
  @Field()
  @Column({ default: 0 })
  minimumPrice: number;

  @Field(() => Auction)
  @ManyToOne(() => Auction, (auction) => auction.auctionParticipant)
  auction: Auction;

  @Field(() => Listing, { nullable: true })
  @JoinColumn({ name: 'auctionId' })
  @Field(() => [Bids], { nullable: true })
  @OneToMany(() => Bids, (bid) => bid.auctionParticipant)
  bid: Bids[];

  @Field(GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(GraphQLISODateTime)
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
