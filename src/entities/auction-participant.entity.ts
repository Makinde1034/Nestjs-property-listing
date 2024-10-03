/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { Auction } from './auction-table.entity';
import BaseEntity from './base.entity';
import { Listing } from './listing.entity';

@Entity()
@ObjectType()
export class AuctionParticipant extends BaseEntity {
  @Field()
  @Column()
  listingId: string;

  @Field(() => Listing)
  @JoinColumn({ name: 'listingId' })
  @OneToOne(() => Listing, (listing) => listing.auctionParticipant)
  listing: Listing;

  @Field()
  @Column({ default: 0 })
  minimumPrice: number;

  @Field(() => Auction)
  @ManyToOne(() => Auction, (auction) => auction.auctionParticipant)
  auction: Auction;

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
